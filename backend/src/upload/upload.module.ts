import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService, LocalStorageProvider } from './upload.service';

@Module({
  controllers: [UploadController],
  providers: [LocalStorageProvider, UploadService],
  exports: [UploadService],
})
export class UploadModule {}
