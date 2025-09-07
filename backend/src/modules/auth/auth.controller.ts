import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Req, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    return this.authService.register(userData);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginData: { email: string; password: string }) {
    return this.authService.login(loginData.email, loginData.password);
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Req() req,
    @Body() resetData: { 
      currentPassword: string; 
      newPassword: string 
    }
  ) {
    // Verify current password first
    await this.authService.login(req.user.email, resetData.currentPassword);
    
    // Reset password
    await this.authService.resetPassword(
      req.user.email, 
      resetData.newPassword
    );

    return { message: 'Password reset successfully' };
  }
}