import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    return this.userService.findById(req.user.id);
  }

  @Put('profile')
  async updateProfile(
    @Req() req,
    @Body() updateData: {
      firstName?: string;
      lastName?: string;
      profilePicture?: string;
      preferences?: {
        language?: string;
        theme?: string;
      }
    }
  ) {
    return this.userService.updateProfile(req.user.id, updateData);
  }

  @Get()
  async listUsers(
    @Query('role') role?: string,
    @Query('isActive') isActive?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.userService.listUsers(
      { role, isActive },
      { page, limit }
    );
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}