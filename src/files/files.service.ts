// https://wanago.io/2020/08/03/api-nestjs-uploading-public-files-to-amazon-s3/
// https://www.zenko.io/blog/first-things-first-getting-started-scality-s3-server/

import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import PublicFileEntity from './public-file.entity';
import PrivateFileEntity from './private-file.entity';
import { AwsService } from './aws.service';

@Injectable()
export class FilesService implements OnModuleInit {
  constructor(
    private readonly awsService: AwsService,
    @InjectRepository(PublicFileEntity)
    private readonly publicFileRepository: Repository<PublicFileEntity>,
    @InjectRepository(PrivateFileEntity)
    private readonly privateFileRepository: Repository<PrivateFileEntity>,
  ) {}
  async onModuleInit() {
    await this.checkAndCreateBucket(this.awsService.publicBucketName);
    await this.checkAndCreateBucket(this.awsService.privateBucketName);
  }

  private async checkAndCreateBucket(bucket: string): Promise<void> {
    try {
      await this.awsService.headBucket(bucket);
    } catch (err) {
      if (err.code === 'NotFound') {
        await this.awsService.createBucket(bucket);
      }
    }
  }

  public async uploadPublicFile(
    file: Express.Multer.File,
  ): Promise<PublicFileEntity> {
    const { buffer, originalname, mimetype } = file;
    const key = `${uuid()}.${originalname.split('.').pop()}`;

    await this.awsService.uploadFile({
      ACL: 'public-read',
      Bucket: this.awsService.publicBucketName,
      Body: buffer,
      ContentType: mimetype,
      Key: key,
    });

    const url = this.awsService.generateFileUrl(key);
    const newFile = this.publicFileRepository.create({ key, url });
    await this.publicFileRepository.save(newFile);

    return newFile;
  }

  public async deletePublicFile(fileId: number) {
    const file = await this.publicFileRepository.findOneBy({ id: fileId });
    await this.awsService.deleteFile({
      Bucket: this.awsService.publicBucketName,
      Key: file.key,
    });
    await this.publicFileRepository.delete(fileId);
  }

  public async uploadPrivateFile(
    dataBuffer: Buffer,
    ownerId: number,
    filename: string,
  ): Promise<PrivateFileEntity> {
    const key = `${uuid()}.${filename.split('.').pop()}`;

    await this.awsService.uploadFile({
      Bucket: this.awsService.privateBucketName,
      Body: dataBuffer,
      Key: key,
    });

    const newFile = this.privateFileRepository.create({
      key,
      owner: { id: ownerId },
    });
    await this.privateFileRepository.save(newFile);

    return newFile;
  }

  public async getPrivateFile(fileId: number) {
    const fileInfo = await this.privateFileRepository.findOne({
      where: { id: fileId },
      relations: { owner: true },
    });

    if (!fileInfo) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    const stream = await this.awsService.getFileStream({
      Bucket: this.awsService.privateBucketName,
      Key: fileInfo.key,
    });

    return {
      stream,
      info: fileInfo,
    };
  }

  public async generatePreSignedUrl(key: string): Promise<string> {
    return this.awsService.generatePreSignedUrl(key);
  }
}
