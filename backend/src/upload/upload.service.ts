import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface StorageProvider {
  uploadFile(file: Express.Multer.File): Promise<string>;
}

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(this.uploadDir, uniqueName);
    await fs.promises.writeFile(filePath, file.buffer);
    return `/uploads/${uniqueName}`;
  }
}

@Injectable()
export class UploadService {
  constructor(private readonly storageProvider: LocalStorageProvider) {}

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
