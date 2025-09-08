#!/usr/bin/env python3
"""
Trade AI Monitoring Service
This module provides real-time monitoring capabilities for the Trade AI platform.
"""

import os
import sys
import json
import time
import logging
import socket
import psutil
import requests
import threading
import queue
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("monitoring.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("trade_ai_monitoring")

# Define API models
class SystemMetrics(BaseModel):
    """System metrics data"""
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_sent: int
    network_received: int
    timestamp: str

class ServiceStatus(BaseModel):
    """Service status data"""
    service_name: str
    status: str
    response_time: float
    last_checked: str
    endpoint: str

class AlertConfig(BaseModel):
    """Alert configuration"""
    metric: str
    threshold: float
    condition: str
    enabled: bool = True
    notify_email: Optional[str] = None
    notify_slack: Optional[str] = None

class Alert(BaseModel):
    """Alert data"""
    id: str
    metric: str
    threshold: float
    current_value: float
    condition: str
    timestamp: str
    resolved: bool = False
    resolved_timestamp: Optional[str] = None

class MonitoringConfig(BaseModel):
    """Monitoring configuration"""
    system_check_interval: int = 60
    service_check_interval: int = 300
    retention_days: int = 30
    alerts: List[AlertConfig] = []

# Initialize FastAPI app
app = FastAPI(
    title="Trade AI Monitoring Service",
    description="Real-time monitoring for Trade AI platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
METRICS_FILE = os.path.join(DATA_DIR, "system_metrics.csv")
SERVICE_STATUS_FILE = os.path.join(DATA_DIR, "service_status.csv")
ALERTS_FILE = os.path.join(DATA_DIR, "alerts.csv")

# In-memory data stores
system_metrics_queue = queue.Queue(maxsize=1000)
service_status_dict = {}
active_alerts = {}
monitoring_config = None

# Background worker threads
system_metrics_thread = None
service_check_thread = None
data_writer_thread = None
alert_checker_thread = None

def load_config():
    """Load monitoring configuration"""
    global monitoring_config
    
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                config_data = json.load(f)
                monitoring_config = MonitoringConfig(**config_data)
        else:
            # Create default config
            monitoring_config = MonitoringConfig(
                system_check_interval=60,
                service_check_interval=300,
                retention_days=30,
                alerts=[
                    AlertConfig(metric="cpu_usage", threshold=90, condition="greater_than"),
                    AlertConfig(metric="memory_usage", threshold=90, condition="greater_than"),
                    AlertConfig(metric="disk_usage", threshold=90, condition="greater_than")
                ]
            )
            
            # Save default config
            with open(CONFIG_FILE, 'w') as f:
                json.dump(monitoring_config.dict(), f, indent=2)
    except Exception as e:
        logger.error(f"Error loading config: {e}")
        monitoring_config = MonitoringConfig()

def save_config():
    """Save monitoring configuration"""
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(monitoring_config.dict(), f, indent=2)
    except Exception as e:
        logger.error(f"Error saving config: {e}")

def ensure_data_dir():
    """Ensure data directory exists"""
    os.makedirs(DATA_DIR, exist_ok=True)

def collect_system_metrics():
    """Collect system metrics"""
    try:
        # Get CPU usage
        cpu_usage = psutil.cpu_percent(interval=1)
        
        # Get memory usage
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        
        # Get disk usage
        disk = psutil.disk_usage('/')
        disk_usage = disk.percent
        
        # Get network stats
        net_io = psutil.net_io_counters()
        network_sent = net_io.bytes_sent
        network_received = net_io.bytes_recv
        
        # Create metrics object
        metrics = SystemMetrics(
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            disk_usage=disk_usage,
            network_sent=network_sent,
            network_received=network_received,
            timestamp=datetime.now().isoformat()
        )
        
        # Add to queue
        if not system_metrics_queue.full():
            system_metrics_queue.put(metrics.dict())
        else:
            logger.warning("Metrics queue is full, dropping oldest metric")
            system_metrics_queue.get()  # Remove oldest
            system_metrics_queue.put(metrics.dict())
        
        return metrics
    except Exception as e:
        logger.error(f"Error collecting system metrics: {e}")
        return None

def check_service_status(service_name, endpoint):
    """Check status of a service"""
    try:
        start_time = time.time()
        response = requests.get(endpoint, timeout=5)
        response_time = time.time() - start_time
        
        status = "up" if response.status_code == 200 else "down"
        
        service_status = ServiceStatus(
            service_name=service_name,
            status=status,
            response_time=response_time,
            last_checked=datetime.now().isoformat(),
            endpoint=endpoint
        )
        
        # Update service status dictionary
        service_status_dict[service_name] = service_status.dict()
        
        return service_status
    except Exception as e:
        logger.error(f"Error checking service {service_name}: {e}")
        
        service_status = ServiceStatus(
            service_name=service_name,
            status="down",
            response_time=-1,
            last_checked=datetime.now().isoformat(),
            endpoint=endpoint
        )
        
        # Update service status dictionary
        service_status_dict[service_name] = service_status.dict()
        
        return service_status

def check_for_alerts(metrics):
    """Check for alerts based on metrics"""
    if not monitoring_config or not monitoring_config.alerts:
        return
    
    for alert_config in monitoring_config.alerts:
        if not alert_config.enabled:
            continue
        
        metric_name = alert_config.metric
        if metric_name not in metrics:
            continue
        
        current_value = metrics[metric_name]
        threshold = alert_config.threshold
        condition = alert_config.condition
        
        alert_triggered = False
        if condition == "greater_than" and current_value > threshold:
            alert_triggered = True
        elif condition == "less_than" and current_value < threshold:
            alert_triggered = True
        elif condition == "equal_to" and current_value == threshold:
            alert_triggered = True
        
        # Generate alert ID based on metric and timestamp
        alert_id = f"{metric_name}_{int(time.time())}"
        
        if alert_triggered:
            # Check if this alert is already active
            existing_alerts = [a for a in active_alerts.values() 
                              if a['metric'] == metric_name and not a['resolved']]
            
            if not existing_alerts:
                # Create new alert
                alert = Alert(
                    id=alert_id,
                    metric=metric_name,
                    threshold=threshold,
                    current_value=current_value,
                    condition=condition,
                    timestamp=datetime.now().isoformat()
                )
                
                active_alerts[alert_id] = alert.dict()
                
                # Send notifications
                if alert_config.notify_email:
                    send_email_alert(alert.dict(), alert_config.notify_email)
                
                if alert_config.notify_slack:
                    send_slack_alert(alert.dict(), alert_config.notify_slack)
                
                logger.warning(f"Alert triggered: {metric_name} = {current_value} {condition} {threshold}")
        else:
            # Check if there are any active alerts for this metric that need to be resolved
            for alert_id, alert in list(active_alerts.items()):
                if alert['metric'] == metric_name and not alert['resolved']:
                    # Resolve the alert
                    active_alerts[alert_id]['resolved'] = True
                    active_alerts[alert_id]['resolved_timestamp'] = datetime.now().isoformat()
                    
                    logger.info(f"Alert resolved: {metric_name} = {current_value}")

def send_email_alert(alert, email):
    """Send email alert (placeholder)"""
    logger.info(f"Would send email alert to {email}: {alert}")
    # In a real implementation, this would use an email service

def send_slack_alert(alert, webhook):
    """Send Slack alert (placeholder)"""
    logger.info(f"Would send Slack alert to webhook: {alert}")
    # In a real implementation, this would use Slack's API

def write_metrics_to_file():
    """Write collected metrics to CSV file"""
    try:
        metrics_list = []
        while not system_metrics_queue.empty():
            metrics_list.append(system_metrics_queue.get())
        
        if not metrics_list:
            return
        
        # Convert to DataFrame
        df = pd.DataFrame(metrics_list)
        
        # Append to CSV or create new file
        if os.path.exists(METRICS_FILE):
            df.to_csv(METRICS_FILE, mode='a', header=False, index=False)
        else:
            df.to_csv(METRICS_FILE, index=False)
            
        # Write service status
        if service_status_dict:
            service_df = pd.DataFrame(list(service_status_dict.values()))
            if os.path.exists(SERVICE_STATUS_FILE):
                service_df.to_csv(SERVICE_STATUS_FILE, mode='a', header=False, index=False)
            else:
                service_df.to_csv(SERVICE_STATUS_FILE, index=False)
        
        # Write alerts
        if active_alerts:
            alerts_df = pd.DataFrame(list(active_alerts.values()))
            if os.path.exists(ALERTS_FILE):
                alerts_df.to_csv(ALERTS_FILE, mode='a', header=False, index=False)
            else:
                alerts_df.to_csv(ALERTS_FILE, index=False)
    except Exception as e:
        logger.error(f"Error writing metrics to file: {e}")

def cleanup_old_data():
    """Clean up old data based on retention policy"""
    if not monitoring_config:
        return
    
    try:
        retention_days = monitoring_config.retention_days
        cutoff_date = datetime.now() - timedelta(days=retention_days)
        
        # Clean up metrics
        if os.path.exists(METRICS_FILE):
            df = pd.read_csv(METRICS_FILE)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df[df['timestamp'] >= cutoff_date]
            df.to_csv(METRICS_FILE, index=False)
        
        # Clean up service status
        if os.path.exists(SERVICE_STATUS_FILE):
            df = pd.read_csv(SERVICE_STATUS_FILE)
            df['last_checked'] = pd.to_datetime(df['last_checked'])
            df = df[df['last_checked'] >= cutoff_date]
            df.to_csv(SERVICE_STATUS_FILE, index=False)
        
        # Clean up alerts
        if os.path.exists(ALERTS_FILE):
            df = pd.read_csv(ALERTS_FILE)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df[df['timestamp'] >= cutoff_date]
            df.to_csv(ALERTS_FILE, index=False)
    except Exception as e:
        logger.error(f"Error cleaning up old data: {e}")

def system_metrics_worker():
    """Background worker to collect system metrics"""
    logger.info("Starting system metrics worker")
    
    while True:
        try:
            if monitoring_config:
                interval = monitoring_config.system_check_interval
            else:
                interval = 60
            
            collect_system_metrics()
            time.sleep(interval)
        except Exception as e:
            logger.error(f"Error in system metrics worker: {e}")
            time.sleep(60)  # Sleep on error to avoid tight loop

def service_check_worker():
    """Background worker to check service status"""
    logger.info("Starting service check worker")
    
    # Define services to check
    services = [
        {"name": "Backend API", "endpoint": "http://localhost:5000/api/health"},
        {"name": "Frontend", "endpoint": "http://localhost:3000/health.json"},
        {"name": "AI Prediction API", "endpoint": "http://localhost:8000/health"}
    ]
    
    while True:
        try:
            if monitoring_config:
                interval = monitoring_config.service_check_interval
            else:
                interval = 300
            
            for service in services:
                check_service_status(service["name"], service["endpoint"])
            
            time.sleep(interval)
        except Exception as e:
            logger.error(f"Error in service check worker: {e}")
            time.sleep(300)  # Sleep on error to avoid tight loop

def data_writer_worker():
    """Background worker to write data to files"""
    logger.info("Starting data writer worker")
    
    while True:
        try:
            write_metrics_to_file()
            time.sleep(60)  # Write every minute
            
            # Clean up old data once per day
            if datetime.now().hour == 0 and datetime.now().minute == 0:
                cleanup_old_data()
        except Exception as e:
            logger.error(f"Error in data writer worker: {e}")
            time.sleep(60)

def alert_checker_worker():
    """Background worker to check for alerts"""
    logger.info("Starting alert checker worker")
    
    while True:
        try:
            # Get latest metrics
            if not system_metrics_queue.empty():
                latest_metrics = system_metrics_queue.queue[-1]
                check_for_alerts(latest_metrics)
            
            time.sleep(30)  # Check every 30 seconds
        except Exception as e:
            logger.error(f"Error in alert checker worker: {e}")
            time.sleep(60)

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    global system_metrics_thread, service_check_thread, data_writer_thread, alert_checker_thread
    
    # Ensure data directory exists
    ensure_data_dir()
    
    # Load configuration
    load_config()
    
    # Start background workers
    system_metrics_thread = threading.Thread(target=system_metrics_worker, daemon=True)
    system_metrics_thread.start()
    
    service_check_thread = threading.Thread(target=service_check_worker, daemon=True)
    service_check_thread.start()
    
    data_writer_thread = threading.Thread(target=data_writer_worker, daemon=True)
    data_writer_thread.start()
    
    alert_checker_thread = threading.Thread(target=alert_checker_worker, daemon=True)
    alert_checker_thread.start()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Trade AI Monitoring Service",
        "version": "1.0.0",
        "status": "active",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/metrics/current")
async def get_current_metrics():
    """Get current system metrics"""
    metrics = collect_system_metrics()
    if metrics:
        return metrics
    else:
        raise HTTPException(status_code=500, detail="Failed to collect metrics")

@app.get("/metrics/history")
async def get_metrics_history(
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000)
):
    """Get historical metrics"""
    try:
        if not os.path.exists(METRICS_FILE):
            return {"metrics": []}
        
        df = pd.read_csv(METRICS_FILE)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        if start_time:
            df = df[df['timestamp'] >= pd.to_datetime(start_time)]
        
        if end_time:
            df = df[df['timestamp'] <= pd.to_datetime(end_time)]
        
        # Sort by timestamp and limit results
        df = df.sort_values('timestamp', ascending=False).head(limit)
        
        return {"metrics": df.to_dict(orient='records')}
    except Exception as e:
        logger.error(f"Error getting metrics history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/services/status")
async def get_service_status():
    """Get status of all services"""
    return {"services": list(service_status_dict.values())}

@app.get("/alerts/active")
async def get_active_alerts():
    """Get active alerts"""
    active = [alert for alert in active_alerts.values() if not alert['resolved']]
    return {"alerts": active}

@app.get("/alerts/history")
async def get_alerts_history(
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000)
):
    """Get historical alerts"""
    try:
        if not os.path.exists(ALERTS_FILE):
            return {"alerts": []}
        
        df = pd.read_csv(ALERTS_FILE)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        if start_time:
            df = df[df['timestamp'] >= pd.to_datetime(start_time)]
        
        if end_time:
            df = df[df['timestamp'] <= pd.to_datetime(end_time)]
        
        # Sort by timestamp and limit results
        df = df.sort_values('timestamp', ascending=False).head(limit)
        
        return {"alerts": df.to_dict(orient='records')}
    except Exception as e:
        logger.error(f"Error getting alerts history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/config")
async def get_config():
    """Get monitoring configuration"""
    if monitoring_config:
        return monitoring_config
    else:
        raise HTTPException(status_code=500, detail="Configuration not loaded")

@app.post("/config")
async def update_config(config: MonitoringConfig):
    """Update monitoring configuration"""
    global monitoring_config
    
    try:
        monitoring_config = config
        save_config()
        return {"status": "success", "message": "Configuration updated"}
    except Exception as e:
        logger.error(f"Error updating config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Manually resolve an alert"""
    if alert_id in active_alerts and not active_alerts[alert_id]['resolved']:
        active_alerts[alert_id]['resolved'] = True
        active_alerts[alert_id]['resolved_timestamp'] = datetime.now().isoformat()
        return {"status": "success", "message": f"Alert {alert_id} resolved"}
    else:
        raise HTTPException(status_code=404, detail=f"Active alert {alert_id} not found")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

def start_server(host="0.0.0.0", port=8080):
    """Start the monitoring server"""
    uvicorn.run("monitoring_service:app", host=host, port=port, reload=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Trade AI Monitoring Service')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to bind')
    parser.add_argument('--port', type=int, default=8080, help='Port to bind')
    
    args = parser.parse_args()
    
    # Create data directory
    ensure_data_dir()
    
    # Start the server
    start_server(host=args.host, port=args.port)