export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'tradeai_super_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  roles: {
    EXECUTIVE: 'executive',
    TRADE_MARKETING_DIRECTOR: 'trade_marketing_director',
    KEY_ACCOUNT_MANAGER: 'key_account_manager',
    FIELD_SALES: 'field_sales',
    EXTERNAL_USER: 'external_user',
  },
  accessLevels: {
    GLOBAL_VIEW: 'global_view',
    DIVISION_VIEW: 'division_view',
    ACCOUNT_VIEW: 'account_view',
    TERRITORY_VIEW: 'territory_view',
    SHARED_VIEW: 'shared_view',
  },
};