// https://wanago.io/2020/08/03/api-nestjs-uploading-public-files-to-amazon-s3/
// https://www.zenko.io/blog/first-things-first-getting-started-scality-s3-server/

import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { S3 } from 'aws-sdk';

import PublicFileEntity from './public-file.entity';
import PrivateFileEntity from './private-file.entity';

@Injectable()
export class FilesService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(PublicFileEntity)
    private readonly publicFileRepository: Repository<PublicFileEntity>,
    @InjectRepository(PrivateFileEntity)
    private readonly privateFileRepository: Repository<PrivateFileEntity>,
  ) {}

  onModuleInit(): any {
    const publicBucket = this.configService.get('S3_PUBLIC_BUCKET_NAME');
    this.checkAndCreateBucket(publicBucket).then();
    const privateBucket = this.configService.get('S3_PRIVATE_BUCKET_NAME');
    this.checkAndCreateBucket(privateBucket).then();
  }

  private async checkAndCreateBucket(bucket: string): Promise<void> {
    const s3 = this.createS3Instance();
    try {
      await s3.headBucket({ Bucket: bucket }).promise();
    } catch (err) {
      if (err.code === 'NotFound') {
        await s3.createBucket({ Bucket: bucket }).promise();
      }
    }
  }

  private createS3Instance(): S3 {
    return new S3({
      endpoint: this.configService.get('S3_ENDPOINT'),
      s3ForcePathStyle: true,
    });
  }

  public async uploadPublicFile({
    buffer,
    filename,
    mimetype,
  }: Express.Multer.File): Promise<PublicFileEntity> {
    const s3 = this.createS3Instance();
    const extension = filename.split('.').reverse()[0];
    const uploadResult = await s3
      .upload({
        ACL: 'public-read',
        Bucket: this.configService.get('S3_PUBLIC_BUCKET_NAME'),
        Body: buffer,
        Key: `${uuid()}.${extension}`,
        ContentType: mimetype,
      })
      .promise();

    const newFile = this.publicFileRepository.create({
      key: uploadResult.Key,
      url: uploadResult.Location,
    });
    await this.publicFileRepository.save(newFile);

    return newFile;
  }

  public async deletePublicFile(fileId: number) {
    const file = await this.publicFileRepository.findOne({ id: fileId });
    const s3 = this.createS3Instance();
    await s3
      .deleteObject({
        Bucket: this.configService.get('S3_PUBLIC_BUCKET_NAME'),
        Key: file.key,
      })
      .promise();
    await this.publicFileRepository.delete(fileId);
  }

  public async uploadPrivateFile(
    dataBuffer: Buffer,
    ownerId: number,
    filename: string,
  ): Promise<PrivateFileEntity> {
    const s3 = this.createS3Instance();
    const extension = filename.split('.').reverse()[0];
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('S3_PRIVATE_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${uuid()}.${extension}`,
      })
      .promise();

    const newFile = this.privateFileRepository.create({
      key: uploadResult.Key,
      owner: {
        id: ownerId,
      },
    });
    await this.privateFileRepository.save(newFile);

    return newFile;
  }

  public async getPrivateFile(fileId: number) {
    const s3 = this.createS3Instance();
    const fileInfo = await this.privateFileRepository.findOne(
      { id: fileId },
      { relations: ['owner'] },
    );
    if (fileInfo) {
      // Thanks to working directly with streams, we don’t have to download the file into the memory in our server.
      const stream = await s3
        .getObject({
          Bucket: this.configService.get('S3_PRIVATE_BUCKET_NAME'),
          Key: fileInfo.key,
        })
        .createReadStream();

      return {
        stream,
        info: fileInfo,
      };
    }
    throw new NotFoundException();
  }

  public generatePreSignedUrl(key: string) {
    const s3 = this.createS3Instance();

    // The default expiration time of a pre-signed URL is 15 minutes.
    // We could change it by adding an Expires parameter.
    return s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('S3_PRIVATE_BUCKET_NAME'),
      Key: key,
    });
  }
}
