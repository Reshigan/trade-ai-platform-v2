# Trade AI API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.trade-ai.com
```

## Authentication

All API requests (except auth endpoints) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Auth Endpoints

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "kam"
  }
}
```

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "analyst"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Budget Management

#### List Budgets
```http
GET /budgets?year=2024&budgetType=annual&status=approved&page=1&limit=20

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "FY2024 Annual Budget",
      "year": 2024,
      "budgetType": "annual",
      "status": "approved",
      "scope": {...},
      "budgetLines": [...],
      "annualTotals": {...}
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 3
  }
}
```

#### Create Budget
```http
POST /budgets
Content-Type: application/json

{
  "name": "FY2025 Annual Budget",
  "year": 2025,
  "budgetType": "annual",
  "scope": {
    "customers": ["507f1f77bcf86cd799439011"],
    "products": ["507f1f77bcf86cd799439012"],
    "channels": ["retail", "wholesale"]
  },
  "generateForecast": true
}
```

#### Generate Forecast
```http
POST /budgets/generate-forecast
Content-Type: application/json

{
  "year": 2025,
  "scope": {
    "customers": ["all"],
    "products": ["all"]
  },
  "historicalMonths": 24
}

Response:
{
  "success": true,
  "data": {
    "generated": true,
    "monthlyForecasts": [...],
    "accuracy": {
      "mape": 5.2,
      "rmse": 1250000
    }
  }
}
```

## Trade Spend Management

#### List Trade Spends
```http
GET /trade-spends?spendType=promotion&status=approved&customer=507f1f77bcf86cd799439011

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "spendId": "TS-2024-0001",
      "spendType": "promotion",
      "category": "display",
      "status": "approved",
      "amount": {
        "requested": 50000,
        "approved": 45000,
        "spent": 42000
      },
      "period": {
        "startDate": "2024-01-01",
        "endDate": "2024-01-31"
      }
    }
  ]
}
```

#### Create Trade Spend
```http
POST /trade-spends
Content-Type: application/json

{
  "spendType": "promotion",
  "category": "display",
  "amount": {
    "requested": 50000
  },
  "period": {
    "startDate": "2024-02-01",
    "endDate": "2024-02-29"
  },
  "customer": "507f1f77bcf86cd799439011",
  "description": "February Display Promotion"
}
```

#### Approve Trade Spend
```http
POST /trade-spends/507f1f77bcf86cd799439011/approve
Content-Type: application/json

{
  "approvedAmount": 45000,
  "comments": "Approved with 10% reduction"
}
```

#### Record Actual Spend
```http
POST /trade-spends/507f1f77bcf86cd799439011/record-spend
Content-Type: application/json

{
  "amount": 42000,
  "documents": ["invoice-001.pdf", "receipt-001.jpg"]
}
```

## Promotion Management

#### List Promotions
```http
GET /promotions?status=active&promotionType=tpr&startDate=2024-01-01&endDate=2024-12-31

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "promotionId": "PROMO-2024-0001",
      "name": "Q1 TPR Campaign",
      "promotionType": "tpr",
      "status": "active",
      "period": {
        "startDate": "2024-01-15",
        "endDate": "2024-02-15"
      },
      "products": [...],
      "financial": {
        "costs": {
          "totalCost": 150000,
          "breakdown": {...}
        },
        "revenue": {
          "baseline": 1000000,
          "incremental": 250000
        }
      }
    }
  ]
}
```

#### Create Promotion
```http
POST /promotions
Content-Type: application/json

{
  "name": "Spring Display Campaign",
  "promotionType": "display",
  "period": {
    "startDate": "2024-03-01",
    "endDate": "2024-03-31"
  },
  "products": [
    {
      "product": "507f1f77bcf86cd799439011",
      "discount": 15,
      "targetVolume": 10000
    }
  ],
  "scope": {
    "customers": [
      {
        "customer": "507f1f77bcf86cd799439011",
        "stores": ["all"]
      }
    ]
  },
  "mechanics": {
    "displayType": "end-cap",
    "requiredFacings": 4
  },
  "generatePredictions": true
}
```

#### Calculate Performance
```http
POST /promotions/507f1f77bcf86cd799439011/calculate-performance

Response:
{
  "success": true,
  "data": {
    "promotion": {...},
    "baseline": {
      "volume": 8000,
      "revenue": 80000
    },
    "during": {
      "volume": 12000,
      "revenue": 102000
    },
    "post": {
      "volume": 7500,
      "revenue": 75000
    },
    "metrics": {
      "uplift": 50,
      "incrementalVolume": 4000,
      "incrementalRevenue": 22000
    },
    "roi": {
      "value": 2.5,
      "paybackPeriod": 45
    }
  }
}
```

## Dashboard APIs

#### Executive Dashboard
```http
GET /dashboards/executive?year=2024

Response:
{
  "success": true,
  "data": {
    "period": {
      "year": 2024,
      "ytd": true
    },
    "kpis": {
      "revenue": {
        "ytd": 25000000,
        "growth": 12.5,
        "vsTarget": 95
      },
      "volume": {
        "ytd": 2500000,
        "growth": 8.3
      },
      "tradeSpend": {
        "total": 3750000,
        "utilization": 75,
        "roi": 6.7
      },
      "margin": {
        "percentage": 28.5,
        "amount": 7125000
      }
    },
    "monthlyTrend": [...],
    "topPerformers": {
      "customers": [...],
      "products": [...]
    },
    "activePromotions": 24,
    "tradeSpendBreakdown": [...],
    "alerts": [...]
  }
}
```

#### KAM Dashboard
```http
GET /dashboards/kam?customerId=507f1f77bcf86cd799439011&year=2024

Response:
{
  "success": true,
  "data": {
    "period": {...},
    "customerPerformance": [...],
    "activePromotions": [...],
    "pendingApprovals": 5,
    "walletBalances": [...],
    "tradeSpendSummary": [...],
    "productPerformance": [...],
    "tasks": [...]
  }
}
```

## SAP Integration

#### Sync Master Data
```http
POST /sap/sync/master-data
Content-Type: application/json

{
  "dataType": "customers",
  "fullSync": true
}

Response:
{
  "success": true,
  "message": "Master data sync initiated",
  "jobId": "job-123456"
}
```

#### Get Sync Status
```http
GET /sap/sync/status/job-123456

Response:
{
  "success": true,
  "data": {
    "id": "job-123456",
    "status": "completed",
    "progress": 100,
    "result": {
      "created": 45,
      "updated": 120,
      "failed": 2
    }
  }
}
```

#### Post Trade Spend to SAP
```http
POST /sap/post/trade-spend
Content-Type: application/json

{
  "tradeSpendId": "507f1f77bcf86cd799439011"
}

Response:
{
  "success": true,
  "data": {
    "documentNumber": "5000012345",
    "message": "Trade spend posted to SAP successfully"
  }
}
```

## Activity Grid

#### Get Activity Grid
```http
GET /activity-grid?startDate=2024-01-01&endDate=2024-01-31&view=month

Response:
{
  "success": true,
  "data": {
    "activities": {
      "2024-01-15": [
        {
          "id": "507f1f77bcf86cd799439011",
          "type": "promotion",
          "title": "January TPR",
          "customer": "Walmart",
          "value": 50000,
          "status": "scheduled",
          "priority": "high",
          "conflicts": 0
        }
      ]
    },
    "view": "month"
  }
}
```

#### Get Heat Map
```http
GET /activity-grid/heat-map?year=2024&month=1&groupBy=customer

Response:
{
  "success": true,
  "data": {
    "period": {
      "year": 2024,
      "month": 1
    },
    "groupBy": "customer",
    "heatMap": [
      {
        "entity": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Walmart",
          "code": "WAL001"
        },
        "days": [
          {
            "date": "2024-01-15",
            "count": 3,
            "value": 150000,
            "intensity": 100
          }
        ]
      }
    ]
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per 15 minutes for authenticated users
- 20 requests per 15 minutes for unauthenticated users

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination:
```
?page=1&limit=20&sort=-createdAt
```

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 8,
    "limit": 20
  }
}
```

## Filtering

Most list endpoints support filtering:
```
?status=active&customer=507f1f77bcf86cd799439011&startDate=2024-01-01
```

## Webhooks

Configure webhooks for real-time notifications:
```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["promotion.approved", "tradespend.created"],
  "secret": "your-webhook-secret"
}
```