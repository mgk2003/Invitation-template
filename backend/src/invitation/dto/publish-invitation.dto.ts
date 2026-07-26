import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsEnum,
  IsNumber,
  IsOptional,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PublishCoupleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  groomName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brideName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logoSrc?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  logoAlt?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  photoSrc?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  photoAlt?: string;
}

export class PublishDatesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  weddingDatetime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  weddingDateDisplay: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  saveTheDateDisplay: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  weddingTimeDisplay: string;
}

export class PublishEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  venue: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  mapLink?: string;
}

export class PublishTipDto {
  @ApiProperty({ enum: ['hashtag', 'map'] })
  @IsEnum(['hashtag', 'map'])
  iconType: 'hashtag' | 'map';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class PublishThingsToKnowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  labelTop: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  surpriseMessage: string;

  @ApiProperty({ type: [PublishTipDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PublishTipDto)
  tips: PublishTipDto[];
}

export class PublishHeroDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  introText: string;
}

export class PublishInviteCardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  loveMessage: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subtitle: string;
}

export class PublishMeetSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  labelTop: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sectionHeading: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bio: string;
}

export class PublishMessageSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paragraph1: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paragraph2: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ctaBadge: string;
}

export class PublishCountdownSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gettingMarriedText: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class PublishSocialDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  instagramHandle: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  instagramLink: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  instagramHandle2?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  instagramLink2?: string;
}

export class PublishFooterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  credit: string;
}

export class PublishMusicDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  src?: string;

  @ApiProperty()
  @IsNumber()
  volume: number;
}

export class PublishInvitationDto {
  @ApiProperty({ example: 'groom-weds-bride' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
  slug: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishCoupleDto)
  couple: PublishCoupleDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishDatesDto)
  dates: PublishDatesDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishHeroDto)
  hero: PublishHeroDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishInviteCardDto)
  inviteCard: PublishInviteCardDto;

  @ApiProperty({ type: [PublishEventDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PublishEventDto)
  events: PublishEventDto[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishMeetSectionDto)
  meetSection: PublishMeetSectionDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishMessageSectionDto)
  messageSection: PublishMessageSectionDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishCountdownSectionDto)
  countdownSection: PublishCountdownSectionDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishThingsToKnowDto)
  thingsToKnow: PublishThingsToKnowDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishSocialDto)
  social: PublishSocialDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishFooterDto)
  footer: PublishFooterDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PublishMusicDto)
  music: PublishMusicDto;
}
