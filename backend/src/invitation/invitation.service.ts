import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Invitation, InvitationDocument, InvitationStatus } from './schemas/invitation.schema';
import { CreateDraftInvitationDto } from './dto/create-draft-invitation.dto';
import { PublishInvitationDto } from './dto/publish-invitation.dto';
import { UpdateInvitationStatusDto } from './dto/update-invitation-status.dto';
import { QueryInvitationDto } from './dto/query-invitation.dto';

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name);

  constructor(
    @InjectModel(Invitation.name) private invitationModel: Model<InvitationDocument>,
  ) {}

  async checkSlug(slug: string, excludeId?: string): Promise<{ available: boolean; slug: string }> {
    const formattedSlug = slug.toLowerCase().trim();
    const query: any = { slug: formattedSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await this.invitationModel.findOne(query);
    return { available: !existing, slug: formattedSlug };
  }

  async checkAndCompletedExpiredInvitations(): Promise<number> {
    const now = new Date().toISOString();
    const result = await this.invitationModel.updateMany(
      {
        status: { $in: [InvitationStatus.ACTIVE, InvitationStatus.INACTIVE] },
        'dates.weddingDatetime': { $lt: now },
      },
      {
        $set: { status: InvitationStatus.COMPLETED },
      },
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`Auto-completed ${result.modifiedCount} past wedding invitations.`);
    }
    return result.modifiedCount;
  }

  private formatDefaultDates(dates: any) {
    if (!dates || !dates.weddingDatetime) return dates;
    const d = new Date(dates.weddingDatetime);
    if (isNaN(d.getTime())) return dates;

    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();

    if (!dates.weddingDateDisplay) {
      dates.weddingDateDisplay = `${day} ${month} ${year}`;
    }
    if (!dates.saveTheDateDisplay) {
      dates.saveTheDateDisplay = `${month} ${String(day).padStart(2, '0')} - ${year}`;
    }
    if (!dates.weddingTimeDisplay) {
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      dates.weddingTimeDisplay = `${formattedHours}:${minutes} ${ampm} Onwards`;
    }
    return dates;
  }

  async createDraft(dto: CreateDraftInvitationDto): Promise<Invitation> {
    const slugCheck = await this.checkSlug(dto.slug);
    if (!slugCheck.available) {
      throw new ConflictException(`Slug '${dto.slug}' is already in use.`);
    }

    if (dto.dates) {
      dto.dates = this.formatDefaultDates(dto.dates);
    }

    const newInvitation = new this.invitationModel({
      ...dto,
      slug: dto.slug.toLowerCase().trim(),
      status: InvitationStatus.DRAFT,
    });

    return newInvitation.save();
  }

  async publishInvitation(dto: PublishInvitationDto): Promise<Invitation> {
    const slugCheck = await this.checkSlug(dto.slug);
    if (!slugCheck.available) {
      throw new ConflictException(`Slug '${dto.slug}' is already in use.`);
    }

    if (dto.dates) {
      dto.dates = this.formatDefaultDates(dto.dates);
    }

    const now = new Date();
    let status = InvitationStatus.ACTIVE;
    if (dto.dates?.weddingDatetime) {
      const weddingDate = new Date(dto.dates.weddingDatetime);
      if (!isNaN(weddingDate.getTime()) && weddingDate < now) {
        status = InvitationStatus.COMPLETED;
      }
    }

    const newInvitation = new this.invitationModel({
      ...dto,
      slug: dto.slug.toLowerCase().trim(),
      status,
    });

    return newInvitation.save();
  }

  async updateDraft(id: string, dto: CreateDraftInvitationDto): Promise<Invitation> {
    const invitation = await this.invitationModel.findById(id);
    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found.`);
    }

    if (dto.slug && dto.slug.toLowerCase().trim() !== invitation.slug) {
      const slugCheck = await this.checkSlug(dto.slug, id);
      if (!slugCheck.available) {
        throw new ConflictException(`Slug '${dto.slug}' is already in use.`);
      }
    }

    if (dto.dates) {
      dto.dates = this.formatDefaultDates(dto.dates);
    }

    Object.assign(invitation, dto);
    if (dto.slug) invitation.slug = dto.slug.toLowerCase().trim();
    invitation.status = InvitationStatus.DRAFT;

    return invitation.save();
  }

  async updatePublished(id: string, dto: PublishInvitationDto): Promise<Invitation> {
    const invitation = await this.invitationModel.findById(id);
    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found.`);
    }

    if (dto.slug && dto.slug.toLowerCase().trim() !== invitation.slug) {
      const slugCheck = await this.checkSlug(dto.slug, id);
      if (!slugCheck.available) {
        throw new ConflictException(`Slug '${dto.slug}' is already in use.`);
      }
    }

    if (dto.dates) {
      dto.dates = this.formatDefaultDates(dto.dates);
    }

    const now = new Date();
    let status = InvitationStatus.ACTIVE;
    if (dto.dates?.weddingDatetime) {
      const weddingDate = new Date(dto.dates.weddingDatetime);
      if (!isNaN(weddingDate.getTime()) && weddingDate < now) {
        status = InvitationStatus.COMPLETED;
      }
    }

    Object.assign(invitation, dto);
    if (dto.slug) invitation.slug = dto.slug.toLowerCase().trim();
    invitation.status = status;

    return invitation.save();
  }

  async toggleStatus(id: string, dto: UpdateInvitationStatusDto): Promise<Invitation> {
    const invitation = await this.invitationModel.findById(id);
    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found.`);
    }

    if (invitation.status === InvitationStatus.DRAFT) {
      throw new BadRequestException('Draft invitations cannot be toggled. Please publish first.');
    }

    invitation.status = dto.status;
    return invitation.save();
  }

  async deleteInvitation(id: string): Promise<{ success: boolean; message: string }> {
    const invitation = await this.invitationModel.findById(id);
    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found.`);
    }

    if (invitation.status === InvitationStatus.ACTIVE) {
      throw new BadRequestException('Active invitations cannot be deleted. Please set to Inactive or Completed first.');
    }

    await this.invitationModel.findByIdAndDelete(id);
    return { success: true, message: 'Invitation deleted successfully.' };
  }

  async findAll(queryDto: QueryInvitationDto) {
    await this.checkAndCompletedExpiredInvitations();

    const {
      search,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = queryDto;

    const filter: FilterQuery<Invitation> = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { 'couple.brideName': regex },
        { 'couple.groomName': regex },
        { slug: regex },
      ];
    }

    if (startDate || endDate) {
      filter['dates.weddingDatetime'] = {};
      if (startDate) {
        filter['dates.weddingDatetime'].$gte = startDate;
      }
      if (endDate) {
        filter['dates.weddingDatetime'].$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;
    const sortField = sortBy === 'weddingDate' ? 'dates.weddingDatetime' : sortBy;
    const sortOptions: any = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      this.invitationModel.find(filter).sort(sortOptions).skip(skip).limit(limit).exec(),
      this.invitationModel.countDocuments(filter).exec(),
    ]);

    // Compute metrics counts for dashboard
    const [totalAll, draftCount, activeCount, inactiveCount, completedCount] = await Promise.all([
      this.invitationModel.countDocuments(),
      this.invitationModel.countDocuments({ status: InvitationStatus.DRAFT }),
      this.invitationModel.countDocuments({ status: InvitationStatus.ACTIVE }),
      this.invitationModel.countDocuments({ status: InvitationStatus.INACTIVE }),
      this.invitationModel.countDocuments({ status: InvitationStatus.COMPLETED }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        total: totalAll,
        draft: draftCount,
        active: activeCount,
        inactive: inactiveCount,
        completed: completedCount,
      },
    };
  }

  async findOne(id: string): Promise<Invitation> {
    await this.checkAndCompletedExpiredInvitations();
    const invitation = await this.invitationModel.findById(id);
    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found.`);
    }
    return invitation;
  }

  async findPublicBySlug(slug: string, clientIp?: string, preview?: boolean): Promise<Invitation> {
    await this.checkAndCompletedExpiredInvitations();
    const formattedSlug = slug.toLowerCase().trim();
    const invitation = await this.invitationModel.findOne({ slug: formattedSlug });
    if (!invitation) {
      throw new NotFoundException('Invitation not found.');
    }

    if (!preview && (invitation.status === InvitationStatus.DRAFT || invitation.status === InvitationStatus.INACTIVE)) {
      throw new BadRequestException('Invitation is not currently published.');
    }

    const now = new Date();
    // Ensure status is marked as Completed if wedding date has passed
    if (invitation.dates?.weddingDatetime && new Date(invitation.dates.weddingDatetime) < now && invitation.status !== InvitationStatus.COMPLETED) {
      invitation.status = InvitationStatus.COMPLETED;
    }

    // Handle view count with IP and time interval (24 hours)
    if (clientIp) {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Filter out log entries older than 24 hours to keep the array small
      const activeLogs = (invitation.viewLogs || []).filter(
        (log) => new Date(log.timestamp) > oneDayAgo
      );

      // Check if this IP viewed in the last 24 hours
      const hasRecentView = activeLogs.some((log) => log.ip === clientIp);

      if (!hasRecentView) {
        // Increment unique views
        invitation.views = (invitation.views || 0) + 1;
        // Add new log entry
        activeLogs.push({ ip: clientIp, timestamp: now });
      }

      invitation.viewLogs = activeLogs;
    }

    await invitation.save();
    return invitation;
  }
}
