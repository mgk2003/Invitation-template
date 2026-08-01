import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export interface StorageProvider {
  uploadFile(file: Express.Multer.File): Promise<string>;
}

@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const isImage = file.mimetype?.startsWith('image/');
    const isAudio = file.mimetype?.startsWith('audio/');
    
    const uploadOptions: any = {
      resource_type: isAudio ? 'video' : 'auto',
      folder: 'wedding_invitations',
    };

    if (isImage) {
      uploadOptions.transformation = [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ];
    } else if (isAudio) {
      uploadOptions.transformation = [
        { audio_codec: 'mp3', audio_bitrate: '128k' }
      ];
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result || !result.secure_url) {
            return reject(new Error('Failed to retrieve secure URL from Cloudinary'));
          }
          resolve(result.secure_url);
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(upload);
    });
  }
}

@Injectable()
export class UploadService {
  constructor(private readonly storageProvider: CloudinaryStorageProvider) {}

  async handleUpload(file: Express.Multer.File) {
    const fileUrl = await this.storageProvider.uploadFile(file);
    return {
      url: fileUrl,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
