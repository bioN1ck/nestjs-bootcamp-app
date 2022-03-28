// https://wanago.io/2020/08/03/api-nestjs-uploading-public-files-to-amazon-s3/
// https://www.zenko.io/blog/first-things-first-getting-started-scality-s3-server/

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { S3 } from 'aws-sdk';

import PublicFileEntity from './public-file.entity';

@Injectable()
export class FilesService implements OnModuleInit {
  constructor(
    @InjectRepository(PublicFileEntity)
    private readonly publicFileRepository: Repository<PublicFileEntity>,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): any {
    this.checkAndCreateBucket().then();
  }

  async checkAndCreateBucket(): Promise<void> {
    const s3 = this.createS3Instance();
    const bucket = this.configService.get('S3_PUBLIC_BUCKET_NAME');
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

  async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    const s3 = this.createS3Instance();
    const extension = filename.split('.').reverse()[0];
    const uploadResult = await s3
      .upload({
        ACL: 'public-read',
        Bucket: this.configService.get('S3_PUBLIC_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${uuid()}.${extension}`,
      })
      .promise();

    const newFile = this.publicFileRepository.create({
      key: uploadResult.Key,
      url: uploadResult.Location,
    });
    await this.publicFileRepository.save(newFile);
    return newFile;
  }

  async deletePublicFile(fileId: number) {
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
}
