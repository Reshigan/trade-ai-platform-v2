import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from '../interfaces/company.interface';
import { User } from '../../user/interfaces/user.interface';
import * as crypto from 'crypto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel('Company') private companyModel: Model<Company>,
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  async createCompany(companyData: Partial<Company>, superAdminId: string): Promise<Company> {
    // Validate unique identifier
    const existingCompany = await this.companyModel.findOne({ 
      $or: [
        { name: companyData.name },
        { identifier: companyData.identifier }
      ]
    });

    if (existingCompany) {
      throw new ConflictException('Company name or identifier already exists');
    }

    // Create company
    const newCompany = new this.companyModel({
      ...companyData,
      status: 'pending',
      licenseType: companyData.licenseType || 'trial',
      userLicenses: {
        total: 5,
        used: 0
      },
      auditTrail: [{
        action: 'Company Created',
        performedBy: superAdminId,
        timestamp: new Date(),
        details: { source: 'system' }
      }]
    });

    return newCompany.save();
  }

  async updateCompanyIntegrations(
    companyId: string, 
    integrationType: 'sso' | 'sap', 
    integrationData: any
  ): Promise<Company> {
    const company = await this.companyModel.findById(companyId);
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Encrypt sensitive data
    if (integrationData.clientSecret) {
      integrationData.clientSecret = this.encryptSecret(integrationData.clientSecret);
    }
    if (integrationData.encryptedPassword) {
      integrationData.encryptedPassword = this.encryptSecret(integrationData.encryptedPassword);
    }

    company.integrations[integrationType] = {
      ...company.integrations[integrationType],
      ...integrationData
    };

    return company.save();
  }

  async configureHierarchy(
    companyId: string, 
    hierarchyType: 'productHierarchy' | 'customerHierarchy', 
    hierarchyLevels: any[]
  ): Promise<Company> {
    const company = await this.companyModel.findById(companyId);
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.hierarchyConfiguration[hierarchyType] = hierarchyLevels;

    return company.save();
  }

  async manageUserLicenses(
    companyId: string, 
    action: 'add' | 'remove', 
    numberOfLicenses: number
  ): Promise<Company> {
    const company = await this.companyModel.findById(companyId);
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (action === 'add') {
      company.userLicenses.total += numberOfLicenses;
    } else {
      // Ensure we don't go below current used licenses
      company.userLicenses.total = Math.max(
        company.userLicenses.used, 
        company.userLicenses.total - numberOfLicenses
      );
    }

    return company.save();
  }

  async getCompanyDetails(companyId: string): Promise<Company> {
    const company = await this.companyModel.findById(companyId)
      .select('-integrations.sso.clientSecret -integrations.sap.encryptedPassword');
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  private encryptSecret(secret: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${key.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
  }

  private decryptSecret(encryptedSecret: string): string {
    const algorithm = 'aes-256-cbc';
    const [keyHex, ivHex, encryptedHex] = encryptedSecret.split(':');
    
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}