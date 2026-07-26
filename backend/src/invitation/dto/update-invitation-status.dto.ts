import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus } from '../schemas/invitation.schema';

export class UpdateInvitationStatusDto {
  @ApiProperty({ enum: [InvitationStatus.ACTIVE, InvitationStatus.INACTIVE] })
  @IsEnum([InvitationStatus.ACTIVE, InvitationStatus.INACTIVE], {
    message: 'Status can only be toggled between Active and Inactive',
  })
  @IsNotEmpty()
  status: InvitationStatus.ACTIVE | InvitationStatus.INACTIVE;
}
