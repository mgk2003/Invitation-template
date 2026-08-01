import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService, CloudinaryStorageProvider } from './upload.service';

@Module({
  controllers: [UploadController],
  providers: [CloudinaryStorageProvider, UploadService],
  exports: [UploadService],
})
export class UploadModule {}
