import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvitationService } from './invitation.service';

@Injectable()
export class InvitationCronService {
  constructor(private readonly invitationService: InvitationService) {}

  // Run every 10 minutes to auto-complete past wedding dates
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    await this.invitationService.checkAndCompletedExpiredInvitations();
  }
}
