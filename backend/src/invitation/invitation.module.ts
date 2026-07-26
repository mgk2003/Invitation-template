import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { InvitationCronService } from './invitation-cron.service';
import { Invitation, InvitationSchema } from './schemas/invitation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invitation.name, schema: InvitationSchema }]),
  ],
  controllers: [InvitationController],
  providers: [InvitationService, InvitationCronService],
  exports: [InvitationService],
})
export class InvitationModule {}
