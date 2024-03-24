import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  GetObjectCommandInput,
  DeleteObjectCommandInput,
  DeleteObjectCommandOutput,
  CreateBucketCommandOutput,
  HeadBucketCommandOutput,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class AwsService {
  private readonly s3Client: S3Client;

  public readonly publicBucketName: string;
  public readonly privateBucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      },
      endpoint: this.configService.get('S3_ENDPOINT'),
      forcePathStyle: this.configService.get('USE_AWS_S3') !== 'true', // Use forcePathStyle for MinIO
    });

    this.publicBucketName = this.configService.get('S3_PUBLIC_BUCKET_NAME');
    this.privateBucketName = this.configService.get('S3_PRIVATE_BUCKET_NAME');
  }

  public generateFileUrl(key: string): string {
    const useAwsS3 = this.configService.get('USE_AWS_S3') === 'true';
    if (useAwsS3) {
      // For AWS S3
      return `https://${this.publicBucketName}.s3.amazonaws.com/${key}`;
    } else {
      // For local MinIO
      return `${this.configService.get('S3_ENDPOINT')}${this.publicBucketName}/${key}`;
    }
  }

  public async uploadFile(
    params: PutObjectCommandInput,
  ): Promise<PutObjectCommandOutput> {
    const command = new PutObjectCommand(params);

    return this.s3Client.send(command);
  }

  public async getFileStream(params: GetObjectCommandInput) {
    const command = new GetObjectCommand(params);
    const response = await this.s3Client.send(command);

    return response.Body as Readable;
  }

  public async generatePreSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.privateBucketName,
      Key: key,
    });

    // Установка срока действия URL, например, 15 минут (900 секунд)
    const expiration = 900;

    return getSignedUrl(this.s3Client, command, { expiresIn: expiration });
  }

  public async deleteFile(
    params: DeleteObjectCommandInput,
  ): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand(params);

    return this.s3Client.send(command);
  }

  public async createBucket(
    bucketName: string,
  ): Promise<CreateBucketCommandOutput> {
    const command = new CreateBucketCommand({ Bucket: bucketName });

    return this.s3Client.send(command);
  }

  public async headBucket(
    bucketName: string,
  ): Promise<HeadBucketCommandOutput> {
    const command = new HeadBucketCommand({ Bucket: bucketName });

    return this.s3Client.send(command);
  }
}
