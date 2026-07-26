import { Injectable, OnModuleInit, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const existingAdmin = await this.adminModel.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('12345678', 10);
      await this.adminModel.create({ username: 'admin', passwordHash });
      this.logger.log('Default Admin created: username=admin, password=12345678');
    }
  }

  async login(loginDto: LoginDto) {
    const admin = await this.adminModel.findOne({ username: loginDto.username });
    if (!admin) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(loginDto.password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { username: admin.username, sub: admin._id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        username: admin.username,
      },
    };
  }
}
