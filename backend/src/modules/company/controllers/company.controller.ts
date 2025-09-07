import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @Roles('super_admin')
  async createCompany(@Req() req, @Body() companyData: any) {
    return this.companyService.createCompany(companyData, req.user.id);
  }

  @Put(':id/integrations/:type')
  @Roles('company_admin')
  async updateCompanyIntegrations(
    @Param('id') companyId: string,
    @Param('type') integrationType: 'sso' | 'sap',
    @Body() integrationData: any
  ) {
    return this.companyService.updateCompanyIntegrations(
      companyId, 
      integrationType, 
      integrationData
    );
  }

  @Put(':id/hierarchy/:type')
  @Roles('company_admin')
  async configureHierarchy(
    @Param('id') companyId: string,
    @Param('type') hierarchyType: 'productHierarchy' | 'customerHierarchy',
    @Body() hierarchyLevels: any[]
  ) {
    return this.companyService.configureHierarchy(
      companyId, 
      hierarchyType, 
      hierarchyLevels
    );
  }

  @Put(':id/licenses')
  @Roles('super_admin')
  async manageUserLicenses(
    @Param('id') companyId: string,
    @Body() licenseData: { 
      action: 'add' | 'remove', 
      numberOfLicenses: number 
    }
  ) {
    return this.companyService.manageUserLicenses(
      companyId, 
      licenseData.action, 
      licenseData.numberOfLicenses
    );
  }

  @Get(':id')
  @Roles('company_admin', 'super_admin')
  async getCompanyDetails(@Param('id') companyId: string) {
    return this.companyService.getCompanyDetails(companyId);
  }

  @Get('sso-providers')
  @Roles('company_admin', 'super_admin')
  getSSOProviders() {
    return {
      providers: [
        { 
          id: 'office365', 
          name: 'Microsoft Office 365', 
          supportedFeatures: ['single_sign_on', 'user_sync'] 
        },
        { 
          id: 'azure', 
          name: 'Azure Active Directory', 
          supportedFeatures: ['single_sign_on', 'advanced_user_management'] 
        },
        { 
          id: 'google', 
          name: 'Google Workspace', 
          supportedFeatures: ['single_sign_on', 'basic_user_sync'] 
        }
      ]
    };
  }

  @Get('sap-integration-types')
  @Roles('company_admin', 'super_admin')
  getSAPIntegrationTypes() {
    return {
      types: [
        { 
          id: 'ecc', 
          name: 'SAP ECC', 
          supportedDataTypes: ['sales', 'master_data', 'inventory'] 
        },
        { 
          id: 'hana', 
          name: 'SAP HANA', 
          supportedDataTypes: ['advanced_analytics', 'real_time_data'] 
        }
      ],
      connectionMethods: [
        { 
          id: 'direct', 
          name: 'Direct Connection', 
          complexity: 'high' 
        },
        { 
          id: 'middleware', 
          name: 'Middleware Integration', 
          complexity: 'medium' 
        },
        { 
          id: 'api', 
          name: 'API Integration', 
          complexity: 'low' 
        }
      ]
    };
  }
}