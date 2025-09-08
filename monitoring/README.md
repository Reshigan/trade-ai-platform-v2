# Trade AI Monitoring Service

Real-time monitoring and alerting system for the Trade AI platform.

## 📊 Overview

The Trade AI Monitoring Service provides comprehensive monitoring capabilities for tracking system performance, service availability, and generating alerts for potential issues. It includes a real-time dashboard for visualizing metrics and managing alerts.

## 🛠️ Features

- **System Metrics Monitoring**: Track CPU, memory, disk, and network usage
- **Service Health Checks**: Monitor the status of all Trade AI services
- **Alerting System**: Configure alerts based on thresholds and receive notifications
- **Historical Data**: Store and visualize historical performance data
- **Real-time Dashboard**: Interactive web dashboard for monitoring and management
- **Configurable Settings**: Customize monitoring intervals and alert thresholds

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Required packages (see `requirements.txt`)

### Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### Running the Monitoring Service

```bash
# Start the monitoring service
python monitoring_service.py --host 0.0.0.0 --port 8080
```

### Accessing the Dashboard

Open your browser and navigate to:
```
http://localhost:8080/dashboard.html
```

## 📊 API Endpoints

### Metrics Endpoints

- `GET /metrics/current`: Get current system metrics
- `GET /metrics/history`: Get historical metrics with optional time range filtering

### Service Status Endpoints

- `GET /services/status`: Get status of all monitored services

### Alerts Endpoints

- `GET /alerts/active`: Get active alerts
- `GET /alerts/history`: Get historical alerts with optional time range filtering
- `POST /alerts/{alert_id}/resolve`: Manually resolve an alert

### Configuration Endpoints

- `GET /config`: Get current monitoring configuration
- `POST /config`: Update monitoring configuration

## ⚙️ Configuration

The monitoring service can be configured through the dashboard or by directly editing the `config.json` file:

```json
{
  "system_check_interval": 60,
  "service_check_interval": 300,
  "retention_days": 30,
  "alerts": [
    {
      "metric": "cpu_usage",
      "threshold": 90,
      "condition": "greater_than",
      "enabled": true,
      "notify_email": "alerts@example.com",
      "notify_slack": "https://hooks.slack.com/services/xxx/yyy/zzz"
    }
  ]
}
```

## 📁 Data Storage

Monitoring data is stored in CSV files in the `data` directory:

- `system_metrics.csv`: Historical system metrics
- `service_status.csv`: Service status history
- `alerts.csv`: Alert history

Data is automatically cleaned up based on the retention policy configured in the settings.

## 🔔 Alerting

The monitoring service supports the following alert conditions:

- `greater_than`: Alert when metric exceeds threshold
- `less_than`: Alert when metric falls below threshold
- `equal_to`: Alert when metric equals threshold

Alerts can be configured to send notifications via:

- Email (requires configuration)
- Slack webhooks (requires configuration)

## 🔄 Integration with Trade AI

The monitoring service integrates with the Trade AI platform by:

1. Monitoring the health of all Trade AI services
2. Tracking system resource usage
3. Providing a unified dashboard for system monitoring
4. Alerting on potential issues before they affect users

## 🛡️ Security Considerations

- The monitoring service should be deployed behind a secure proxy
- Access to the dashboard should be restricted to authorized personnel
- Sensitive information should not be included in alert notifications
- API endpoints should be secured with appropriate authentication in production