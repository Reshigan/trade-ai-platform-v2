import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from '../../company/interfaces/company.interface';
import { User } from '../../user/interfaces/user.interface';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SSOService {
  constructor(
    @InjectModel('Company') private companyModel: Model<Company>,
    @InjectModel('User') private userModel: Model<User>
  ) {}

  async authenticateWithOffice365(code: string, companyId: string) {
    const company = await this.companyModel.findById(companyId);
    
    if (!company || !company.integrations.sso) {
      throw new UnauthorizedException('SSO not configured for this company');
    }

    const { clientId, clientSecret, tenantId } = company.integrations.sso;

    try {
      // Exchange authorization code for access token
      const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: 'https://your-app-domain.com/callback'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Validate and decode ID token
      const { access_token, id_token } = tokenResponse.data;
      const decodedToken = jwt.decode(id_token, { complete: true });

      // Find or create user
      const userEmail = decodedToken.payload.email;
      let user = await this.userModel.findOne({ email: userEmail });

      if (!user) {
        user = new this.userModel({
          email: userEmail,
          firstName: decodedToken.payload.given_name,
          lastName: decodedToken.payload.family_name,
          company: companyId,
          ssoProvider: 'office365'
        });
        await user.save();
      }

      // Generate application JWT
      const appToken = this.generateApplicationToken(user);

      return {
        user,
        token: appToken,
        microsoftAccessToken: access_token
      };
    } catch (error) {
      throw new UnauthorizedException('SSO Authentication Failed');
    }
  }

  async syncUserFromOffice365(companyId: string) {
    const company = await this.companyModel.findById(companyId);
    
    if (!company || !company.integrations.sso) {
      throw new UnauthorizedException('SSO not configured for this company');
    }

    try {
      // Microsoft Graph API call to sync users
      const graphResponse = await axios.get(
        'https://graph.microsoft.com/v1.0/users',
        {
          headers: {
            'Authorization': `Bearer ${company.integrations.sso.microsoftAccessToken}`
          }
        }
      );

      const microsoftUsers = graphResponse.data.value;

      // Sync users to application
      const syncedUsers = await Promise.all(
        microsoftUsers.map(async (msUser) => {
          let user = await this.userModel.findOne({ 
            email: msUser.mail,
            company: companyId
          });

          if (!user) {
            user = new this.userModel({
              email: msUser.mail,
              firstName: msUser.givenName,
              lastName: msUser.surname,
              company: companyId,
              ssoProvider: 'office365'
            });
          }

          // Update user details
          user.displayName = msUser.displayName;
          user.jobTitle = msUser.jobTitle;

          return user.save();
        })
      );

      return syncedUsers;
    } catch (error) {
      throw new UnauthorizedException('User Sync Failed');
    }
  }

  private generateApplicationToken(user: User) {
    return jwt.sign(
      {
        sub: user._id,
        email: user.email,
        company: user.company,
        roles: user.roles
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}