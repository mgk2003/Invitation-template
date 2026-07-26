import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsArray,
  IsNumber,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DraftCoupleDto {
  @ApiProperty({ example: 'Naveen' })
  @IsString()
  @IsNotEmpty()
  groomName: string;

  @ApiProperty({ example: 'Nandhini' })
  @IsString()
  @IsNotEmpty()
  brideName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoSrc?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoAlt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  photoSrc?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  photoAlt?: string;
}

export class DraftDatesDto {
  @ApiProperty({ example: '2026-07-06T06:15:00' })
  @IsString()
  @IsNotEmpty()
  weddingDatetime: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  weddingDateDisplay?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  saveTheDateDisplay?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  weddingTimeDisplay?: string;
}

export class CreateDraftInvitationDto {
  @ApiProperty({ example: 'groom-weds-bride' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
  slug: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => DraftCoupleDto)
  couple: DraftCoupleDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => DraftDatesDto)
  dates: DraftDatesDto;

  @ApiPropertyOptional()
  @IsOptional()
  hero?: any;

  @ApiPropertyOptional()
  @IsOptional()
  inviteCard?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  events?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  meetSection?: any;

  @ApiPropertyOptional()
  @IsOptional()
  messageSection?: any;

  @ApiPropertyOptional()
  @IsOptional()
  countdownSection?: any;

  @ApiPropertyOptional()
  @IsOptional()
  thingsToKnow?: any;

  @ApiPropertyOptional()
  @IsOptional()
  social?: any;

  @ApiPropertyOptional()
  @IsOptional()
  footer?: any;

  @ApiPropertyOptional()
  @IsOptional()
  music?: any;
}
