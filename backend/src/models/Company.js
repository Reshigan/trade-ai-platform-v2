const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  industry: {
    type: String,
    enum: ['FMCG', 'Retail', 'Manufacturing', 'Distribution', 'Other'],
    default: 'FMCG'
  },
  country: {
    type: String,
    required: true,
    default: 'South Africa'
  },
  currency: {
    type: String,
    required: true,
    default: 'ZAR'
  },
  timezone: {
    type: String,
    required: true,
    default: 'Africa/Johannesburg'
  },
  
  // License and subscription info
  license: {
    type: {
      type: String,
      enum: ['trial', 'basic', 'professional', 'enterprise'],
      default: 'trial'
    },
    maxUsers: {
      type: Number,
      default: 5
    },
    maxDataRetentionMonths: {
      type: Number,
      default: 12
    },
    features: [{
      type: String,
      enum: [
        'dashboard',
        'budgets',
        'promotions',
        'trade_spend',
        'analytics',
        'reports',
        'sap_integration',
        'api_access',
        'custom_branding',
        'advanced_analytics',
        'ml_forecasting',
        'audit_logs'
      ]
    }],
    expiresAt: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },

  // SSO Configuration
  sso: {
    enabled: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      enum: ['azure_ad', 'google', 'okta', 'saml'],
      required: false
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },

  // SAP Integration Configuration
  sapIntegration: {
    enabled: {
      type: Boolean,
      default: false
    },
    config: {
      host: String,
      client: String,
      systemNumber: String,
      username: String,
      encryptedPassword: String,
      syncFrequency: {
        type: String,
        enum: ['hourly', 'daily', 'weekly'],
        default: 'daily'
      },
      lastSync: Date,
      syncStatus: {
        type: String,
        enum: ['active', 'error', 'disabled'],
        default: 'disabled'
      }
    }
  },

  // Company settings
  settings: {
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    numberFormat: {
      type: String,
      default: 'en-ZA'
    },
    fiscalYearStart: {
      type: Number,
      min: 1,
      max: 12,
      default: 4 // April for South Africa
    },
    budgetApprovalWorkflow: {
      type: Boolean,
      default: true
    },
    promotionApprovalWorkflow: {
      type: Boolean,
      default: true
    },
    autoDataBackup: {
      type: Boolean,
      default: true
    }
  },

  // Contact information
  contactInfo: {
    primaryContact: {
      name: String,
      email: String,
      phone: String
    },
    billingContact: {
      name: String,
      email: String,
      phone: String
    },
    technicalContact: {
      name: String,
      email: String,
      phone: String
    }
  },

  // Address
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: {
      type: String,
      default: 'South Africa'
    }
  },

  // Status and metadata
  status: {
    type: String,
    enum: ['active', 'suspended', 'trial', 'expired'],
    default: 'trial'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  
  // Audit fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
companySchema.index({ slug: 1 });
companySchema.index({ domain: 1 });
companySchema.index({ status: 1 });
companySchema.index({ 'license.isActive': 1 });

// Virtual for user count
companySchema.virtual('userCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'company',
  count: true
});

// Pre-save middleware
companySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate slug from name if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  next();
});

// Instance methods
companySchema.methods.isLicenseValid = function() {
  return this.license.isActive && 
         this.license.expiresAt > new Date() && 
         this.status === 'active';
};

companySchema.methods.hasFeature = function(feature) {
  return this.license.features.includes(feature);
};

companySchema.methods.canAddUser = function(currentUserCount) {
  return currentUserCount < this.license.maxUsers;
};

// Static methods
companySchema.statics.findByDomain = function(domain) {
  return this.findOne({ 
    domain: domain.toLowerCase(),
    isActive: true 
  });
};

companySchema.statics.findBySlug = function(slug) {
  return this.findOne({ 
    slug: slug.toLowerCase(),
    isActive: true 
  });
};

const Company = mongoose.model('Company', companySchema);

module.exports = Company;