import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanySchema } from './schemas/company.schema';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Company', schema: CompanySchema }
    ]),
    AuthModule,
    UserModule
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService]
})