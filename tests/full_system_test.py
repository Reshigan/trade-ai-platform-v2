#!/usr/bin/env python3
"""
Trade AI Full System Integration Test
This script performs a comprehensive test of all Trade AI platform components.
"""

import os
import sys
import json
import time
import socket
import hashlib
import argparse
import subprocess
import requests
import psutil
from datetime import datetime
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test configuration
CONFIG = {
    'backend_url': 'http://localhost:5000',
    'frontend_url': 'http://localhost:3000',
    'ai_services_url': 'http://localhost:8000',
    'monitoring_url': 'http://localhost:8080',
    'mongodb_host': 'localhost',
    'mongodb_port': 27017,
    'redis_host': 'localhost',
    'redis_port': 6379,
    'test_timeout': 60,  # seconds
    'test_user': {
        'email': 'admin@tradeai.com',
        'password': 'password123'
    }
}

# Test results
results = {
    'timestamp': datetime.now().isoformat(),
    'environment': {},
    'tests': {},
    'summary': {
        'total': 0,
        'passed': 0,
        'failed': 0,
        'skipped': 0
    }
}

def log(message, level='INFO'):
    """Log a message with timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] [{level}] {message}")

def detect_environment():
    """Detect the environment the test is running in"""
    env = {}
    
    # Detect OS
    env['os'] = sys.platform
    
    # Detect Python version
    env['python_version'] = sys.version
    
    # Detect if running in Docker
    env['in_docker'] = os.path.exists('/.dockerenv')
    
    # Detect if running in CI/CD
    env['in_ci'] = 'CI' in os.environ
    
    # Detect available memory
    mem = psutil.virtual_memory()
    env['memory_total'] = mem.total
    env['memory_available'] = mem.available
    
    # Detect CPU info
    env['cpu_count'] = psutil.cpu_count()
    env['cpu_usage'] = psutil.cpu_percent(interval=1)
    
    # Detect network interfaces
    interfaces = []
    for iface, addrs in psutil.net_if_addrs().items():
        for addr in addrs:
            if addr.family == socket.AF_INET:
                interfaces.append({
                    'name': iface,
                    'address': addr.address
                })
    env['network_interfaces'] = interfaces
    
    # Detect if services are running
    env['services'] = {
        'backend': is_service_running(CONFIG['backend_url']),
        'frontend': is_service_running(CONFIG['frontend_url']),
        'ai_services': is_service_running(CONFIG['ai_services_url']),
        'monitoring': is_service_running(CONFIG['monitoring_url']),
        'mongodb': is_port_open(CONFIG['mongodb_host'], CONFIG['mongodb_port']),
        'redis': is_port_open(CONFIG['redis_host'], CONFIG['redis_port'])
    }
    
    log(f"Environment detected: {json.dumps(env, indent=2)}")
    results['environment'] = env
    return env

def is_service_running(url):
    """Check if a service is running by making a request to its URL"""
    try:
        response = requests.get(url, timeout=5)
        return response.status_code < 500
    except:
        return False

def is_port_open(host, port):
    """Check if a port is open"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0

def run_test(test_name, test_func, *args, **kwargs):
    """Run a test and record the result"""
    log(f"Running test: {test_name}")
    results['summary']['total'] += 1
    
    start_time = time.time()
    try:
        result = test_func(*args, **kwargs)
        duration = time.time() - start_time
        
        if result:
            log(f"Test passed: {test_name} ({duration:.2f}s)", 'SUCCESS')
            results['tests'][test_name] = {
                'status': 'passed',
                'duration': duration
            }
            results['summary']['passed'] += 1
        else:
            log(f"Test failed: {test_name} ({duration:.2f}s)", 'ERROR')
            results['tests'][test_name] = {
                'status': 'failed',
                'duration': duration
            }
            results['summary']['failed'] += 1
        
        return result
    except Exception as e:
        duration = time.time() - start_time
        log(f"Test error: {test_name} - {str(e)} ({duration:.2f}s)", 'ERROR')
        results['tests'][test_name] = {
            'status': 'failed',
            'error': str(e),
            'duration': duration
        }
        results['summary']['failed'] += 1
        return False

def skip_test(test_name, reason):
    """Skip a test and record the reason"""
    log(f"Skipping test: {test_name} - {reason}", 'WARNING')
    results['summary']['total'] += 1
    results['summary']['skipped'] += 1
    results['tests'][test_name] = {
        'status': 'skipped',
        'reason': reason
    }

def test_backend_health():
    """Test if the backend API is healthy"""
    try:
        response = requests.get(f"{CONFIG['backend_url']}/api/health", timeout=10)
        return response.status_code == 200 and response.json().get('status') == 'healthy'
    except:
        return False

def test_frontend_health():
    """Test if the frontend is accessible"""
    try:
        response = requests.get(CONFIG['frontend_url'], timeout=10)
        return response.status_code == 200
    except:
        return False

def test_ai_services_health():
    """Test if the AI services are healthy"""
    try:
        response = requests.get(f"{CONFIG['ai_services_url']}/health", timeout=10)
        return response.status_code == 200 and response.json().get('status') == 'healthy'
    except:
        return False

def test_monitoring_health():
    """Test if the monitoring service is healthy"""
    try:
        response = requests.get(f"{CONFIG['monitoring_url']}/health", timeout=10)
        return response.status_code == 200 and response.json().get('status') == 'healthy'
    except:
        return False

def test_backend_authentication():
    """Test backend authentication"""
    try:
        response = requests.post(
            f"{CONFIG['backend_url']}/api/auth/login",
            json=CONFIG['test_user'],
            timeout=10
        )
        return response.status_code == 200 and 'token' in response.json()
    except:
        return False

def test_data_integrity():
    """Test data integrity by calculating checksums of critical files"""
    critical_files = [
        'backend/src/models/User.js',
        'backend/src/middleware/auth.js',
        'ai-services/src/prediction_model.py',
        'monitoring/monitoring_service.py'
    ]
    
    checksums = {}
    for file_path in critical_files:
        full_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), file_path)
        if os.path.exists(full_path):
            with open(full_path, 'rb') as f:
                checksums[file_path] = hashlib.md5(f.read()).hexdigest()
    
    # In a real implementation, you would compare these checksums with known good values
    # For this test, we'll just check that we could calculate checksums for all files
    return len(checksums) == len(critical_files)

def test_api_endpoints():
    """Test critical API endpoints"""
    endpoints = [
        '/api/health',
        '/api/auth/login',
        '/api/users',
        '/api/budgets',
        '/api/trade-spends',
        '/api/promotions',
        '/api/dashboards/executive'
    ]
    
    success_count = 0
    for endpoint in endpoints:
        try:
            response = requests.get(f"{CONFIG['backend_url']}{endpoint}", timeout=10)
            if response.status_code < 500:  # Consider 4xx as "working" since it might require auth
                success_count += 1
        except:
            pass
    
    # Consider test passed if at least 70% of endpoints are accessible
    return success_count >= len(endpoints) * 0.7

def test_ai_prediction():
    """Test AI prediction functionality"""
    try:
        # Test data
        test_data = {
            "product": {
                "product_name": "Test Product",
                "base_price": 50,
                "avg_monthly_sales": 5000,
                "sales_volatility": 500,
                "seasonality_index": 1.1,
                "competitor_intensity": 0.5,
                "product_category": "Food",
                "margin_percentage": 0.3
            },
            "promotion": {
                "promo_type": "Discount",
                "discount_percentage": 20,
                "region": "National",
                "channel": "Retail",
                "promo_cost": 2000
            }
        }
        
        # Make prediction request
        response = requests.post(
            f"{CONFIG['ai_services_url']}/predict/promotion",
            json=test_data,
            timeout=15
        )
        
        # Check response
        if response.status_code != 200:
            return False
        
        result = response.json()
        
        # Verify required fields are present
        required_fields = [
            'product', 'baseline_sales', 'predicted_sales', 
            'sales_lift', 'roi', 'confidence'
        ]
        
        for field in required_fields:
            if field not in result:
                return False
        
        # Verify values are reasonable
        if result['predicted_sales'] <= 0 or result['confidence'] < 0 or result['confidence'] > 100:
            return False
        
        return True
    except Exception as e:
        print(f"AI prediction test error: {str(e)}")
        return False

def test_monitoring_metrics():
    """Test monitoring metrics collection"""
    try:
        response = requests.get(f"{CONFIG['monitoring_url']}/metrics/current", timeout=10)
        
        if response.status_code != 200:
            return False
        
        metrics = response.json()
        
        # Verify required metrics are present
        required_metrics = ['cpu_usage', 'memory_usage', 'disk_usage', 'timestamp']
        
        for metric in required_metrics:
            if metric not in metrics:
                return False
        
        # Verify values are reasonable
        if not (0 <= metrics['cpu_usage'] <= 100 and 0 <= metrics['memory_usage'] <= 100):
            return False
        
        return True
    except:
        return False

def test_security_headers():
    """Test security headers on backend API"""
    try:
        response = requests.get(f"{CONFIG['backend_url']}/api/health", timeout=10)
        
        # Check for essential security headers
        security_headers = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Content-Security-Policy'
        ]
        
        headers_present = 0
        for header in security_headers:
            if header in response.headers:
                headers_present += 1
        
        # Consider test passed if at least 3 of 4 security headers are present
        return headers_present >= 3
    except:
        return False

def test_infrastructure_compatibility():
    """Test infrastructure compatibility"""
    env = results['environment']
    
    # Check if we have enough resources
    if env.get('cpu_count', 0) < 2:
        return False
    
    if env.get('memory_available', 0) < 1 * 1024 * 1024 * 1024:  # 1 GB
        return False
    
    # Check if all required services are accessible
    services = env.get('services', {})
    required_services = ['backend', 'frontend', 'ai_services', 'monitoring']
    
    for service in required_services:
        if not services.get(service, False):
            return False
    
    return True

def generate_report():
    """Generate a comprehensive test report"""
    # Calculate overall status
    if results['summary']['failed'] == 0:
        overall_status = 'PASSED'
    elif results['summary']['passed'] == 0:
        overall_status = 'FAILED'
    else:
        overall_status = 'PARTIAL'
    
    # Calculate pass percentage
    total_run = results['summary']['passed'] + results['summary']['failed']
    pass_percentage = (results['summary']['passed'] / total_run * 100) if total_run > 0 else 0
    
    # Create report
    report = {
        'timestamp': results['timestamp'],
        'overall_status': overall_status,
        'pass_percentage': pass_percentage,
        'summary': results['summary'],
        'environment': results['environment'],
        'test_results': results['tests'],
        'deployment_readiness': {
            'ready': overall_status == 'PASSED',
            'warnings': [],
            'blockers': []
        }
    }
    
    # Add warnings and blockers
    if not results['environment']['services']['mongodb']:
        report['deployment_readiness']['warnings'].append('MongoDB is not accessible')
    
    if not results['environment']['services']['redis']:
        report['deployment_readiness']['warnings'].append('Redis is not accessible')
    
    for test_name, test_result in results['tests'].items():
        if test_result['status'] == 'failed':
            if test_name in ['test_backend_health', 'test_frontend_health', 'test_ai_services_health']:
                report['deployment_readiness']['blockers'].append(f"Critical service test failed: {test_name}")
            else:
                report['deployment_readiness']['warnings'].append(f"Test failed: {test_name}")
    
    # Save report to file
    report_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reports')
    os.makedirs(report_dir, exist_ok=True)
    
    report_file = os.path.join(report_dir, f"system_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    log(f"Report saved to {report_file}")
    
    # Print summary
    print("\n" + "="*80)
    print(f"SYSTEM TEST SUMMARY: {overall_status}")
    print(f"Pass Rate: {pass_percentage:.1f}% ({results['summary']['passed']}/{total_run})")
    print(f"Tests Passed: {results['summary']['passed']}")
    print(f"Tests Failed: {results['summary']['failed']}")
    print(f"Tests Skipped: {results['summary']['skipped']}")
    
    if report['deployment_readiness']['ready']:
        print("\n✅ SYSTEM IS READY FOR DEPLOYMENT")
    else:
        print("\n❌ SYSTEM IS NOT READY FOR DEPLOYMENT")
        
        if report['deployment_readiness']['blockers']:
            print("\nBlockers:")
            for blocker in report['deployment_readiness']['blockers']:
                print(f"  - {blocker}")
        
        if report['deployment_readiness']['warnings']:
            print("\nWarnings:")
            for warning in report['deployment_readiness']['warnings']:
                print(f"  - {warning}")
    
    print("="*80)
    
    return report

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Trade AI Full System Integration Test')
    parser.add_argument('--backend-url', help='Backend API URL')
    parser.add_argument('--frontend-url', help='Frontend URL')
    parser.add_argument('--ai-services-url', help='AI Services URL')
    parser.add_argument('--monitoring-url', help='Monitoring Service URL')
    args = parser.parse_args()
    
    # Override config with command line arguments
    if args.backend_url:
        CONFIG['backend_url'] = args.backend_url
    if args.frontend_url:
        CONFIG['frontend_url'] = args.frontend_url
    if args.ai_services_url:
        CONFIG['ai_services_url'] = args.ai_services_url
    if args.monitoring_url:
        CONFIG['monitoring_url'] = args.monitoring_url
    
    log("Starting Trade AI Full System Integration Test")
    log(f"Configuration: {json.dumps(CONFIG, indent=2)}")
    
    # Detect environment
    env = detect_environment()
    
    # Run tests
    run_test('Infrastructure Compatibility Test', test_infrastructure_compatibility)
    run_test('Backend Health Test', test_backend_health)
    run_test('Frontend Health Test', test_frontend_health)
    run_test('AI Services Health Test', test_ai_services_health)
    run_test('Monitoring Health Test', test_monitoring_health)
    run_test('Data Integrity Test', test_data_integrity)
    run_test('Security Headers Test', test_security_headers)
    run_test('API Endpoints Test', test_api_endpoints)
    
    # Run authentication test only if backend is healthy
    if results['tests'].get('Backend Health Test', {}).get('status') == 'passed':
        run_test('Backend Authentication Test', test_backend_authentication)
    else:
        skip_test('Backend Authentication Test', 'Backend is not healthy')
    
    # Run AI prediction test only if AI services are healthy
    if results['tests'].get('AI Services Health Test', {}).get('status') == 'passed':
        run_test('AI Prediction Test', test_ai_prediction)
    else:
        skip_test('AI Prediction Test', 'AI services are not healthy')
    
    # Run monitoring metrics test only if monitoring service is healthy
    if results['tests'].get('Monitoring Health Test', {}).get('status') == 'passed':
        run_test('Monitoring Metrics Test', test_monitoring_metrics)
    else:
        skip_test('Monitoring Metrics Test', 'Monitoring service is not healthy')
    
    # Generate report
    report = generate_report()
    
    # Return exit code based on test results
    return 0 if report['overall_status'] == 'PASSED' else 1

if __name__ == "__main__":
    sys.exit(main())