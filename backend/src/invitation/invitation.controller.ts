import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvitationService } from './invitation.service';
import { CreateDraftInvitationDto } from './dto/create-draft-invitation.dto';
import { PublishInvitationDto } from './dto/publish-invitation.dto';
import { UpdateInvitationStatusDto } from './dto/update-invitation-status.dto';
import { QueryInvitationDto } from './dto/query-invitation.dto';

@ApiTags('Invitations')
@Controller()
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get('check-slug/:slug')
  @ApiOperation({ summary: 'Check if slug is available' })
  async checkSlug(@Param('slug') slug: string, @Query('excludeId') excludeId?: string) {
    return this.invitationService.checkSlug(slug, excludeId);
  }

  @Get('public/:slug')
  @ApiOperation({ summary: 'Get public invitation details by slug' })
  async getPublicInvitation(@Param('slug') slug: string, @Req() request: any) {
    const ip = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    return this.invitationService.findPublicBySlug(slug, ip);
  }

  @Get('invitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invitations with filters, search, pagination, and counts' })
  async getInvitations(@Query() queryDto: QueryInvitationDto) {
    return this.invitationService.findAll(queryDto);
  }

  @Get('invitations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invitation by ID' })
  async getInvitation(@Param('id') id: string) {
    return this.invitationService.findOne(id);
  }

  @Post('invitations/draft')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create invitation as Draft' })
  async createDraft(@Body() dto: CreateDraftInvitationDto) {
    return this.invitationService.createDraft(dto);
  }

  @Post('invitations/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create invitation as Published/Active' })
  async publishInvitation(@Body() dto: PublishInvitationDto) {
    return this.invitationService.publishInvitation(dto);
  }

  @Patch('invitations/:id/draft')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update invitation draft' })
  async updateDraft(@Param('id') id: string, @Body() dto: CreateDraftInvitationDto) {
    return this.invitationService.updateDraft(id, dto);
  }

  @Patch('invitations/:id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update published invitation' })
  async updatePublished(@Param('id') id: string, @Body() dto: PublishInvitationDto) {
    return this.invitationService.updatePublished(id, dto);
  }

  @Patch('invitations/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle status between Active and Inactive' })
  async toggleStatus(@Param('id') id: string, @Body() dto: UpdateInvitationStatusDto) {
    return this.invitationService.toggleStatus(id, dto);
  }

  @Delete('invitations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete invitation (Draft or Inactive only)' })
  async deleteInvitation(@Param('id') id: string) {
    return this.invitationService.deleteInvitation(id);
  }
}
