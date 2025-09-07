import * as mongoose from 'mongoose';

export const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  identifier: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'pending',
  },
  licenseType: {
    type: String,
    enum: ['trial', 'basic', 'professional', 'enterprise'],
    default: 'trial',
  },
  userLicenses: {
    total: {
      type: Number,
      default: 5,
    },
    used: {
      type: Number,
      default: 0,
    },
  },
  integrations: {
    sso: {
      provider: {
        type: String,
        enum: ['office365', 'google', 'azure', 'custom'],
      },
      clientId: String,
      clientSecret: String,
      tenantId: String,
    },
    sap: {
      type: {
        type: String,
        enum: ['ecc', 'hana', 'custom'],
      },
      endpoint: String,
      username: String,
      encryptedPassword: String,
      connectionType: {
        type: String,
        enum: ['direct', 'middleware', 'api'],
      },
    },
  },
  hierarchyConfiguration: {
    productHierarchy: [{
      level: Number,
      name: String,
      parentLevel: Number,
    }],
    customerHierarchy: [{
      level: Number,
      name: String,
      parentLevel: Number,
    }],
  },
  billingInformation: {
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      default: 'monthly',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending',
    },
  },
  supportContact: {
    primaryContact: {
      name: String,
      email: String,
      phone: String,
    },
    technicalContact: {
      name: String,
      email: String,
      phone: String,
    },
  },
  auditTrail: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: mongoose.Schema.Types.Mixed,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});