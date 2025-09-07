import { Document } from 'mongoose';

export interface Company extends Document {
  name: string;
  identifier: string;
  description?: string;
  status: 'active' | 'suspended' | 'pending';
  licenseType: 'trial' | 'basic' | 'professional' | 'enterprise';
  userLicenses: {
    total: number;
    used: number;
  };
  integrations: {
    sso?: {
      provider: 'office365' | 'google' | 'azure' | 'custom';
      clientId?: string;
      clientSecret?: string;
      tenantId?: string;
    };
    sap?: {
      type: 'ecc' | 'hana' | 'custom';
      endpoint?: string;
      username?: string;
      encryptedPassword?: string;
      connectionType: 'direct' | 'middleware' | 'api';
    };
  };
  hierarchyConfiguration: {
    productHierarchy: Array<{
      level: number;
      name: string;
      parentLevel?: number;
    }>;
    customerHierarchy: Array<{
      level: number;
      name: string;
      parentLevel?: number;
    }>;
  };
  billingInformation: {
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    billingCycle: 'monthly' | 'quarterly' | 'annually';
    paymentStatus: 'paid' | 'pending' | 'overdue';
  };
  supportContact: {
    primaryContact?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    technicalContact?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };
  auditTrail: Array<{
    action: string;
    performedBy: string;
    timestamp: Date;
    details?: any;
  }>;
  createdAt: Date;
  updatedAt: Date;
}