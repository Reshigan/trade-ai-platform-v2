import apiClient from '../api/apiClient';

/**
 * SAP Integration Service
 * Handles all SAP-related operations and data synchronization
 */
class SAPService {
  constructor() {
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.lastSyncTime = null;
  }

  /**
   * Test SAP connection
   * @param {Object} connectionConfig - SAP connection configuration
   */
  async testConnection(connectionConfig) {
    try {
      const response = await apiClient.post('/sap/test-connection', connectionConfig);
      this.isConnected = response.data.success;
      this.connectionStatus = response.data.success ? 'connected' : 'failed';
      return response.data;
    } catch (error) {
      console.error('SAP connection test failed:', error);
      this.isConnected = false;
      this.connectionStatus = 'failed';
      throw error;
    }
  }

  /**
   * Configure SAP connection
   * @param {Object} config - SAP configuration
   */
  async configureConnection(config) {
    try {
      const response = await apiClient.post('/sap/configure', config);
      return response.data;
    } catch (error) {
      console.error('SAP configuration failed:', error);
      throw error;
    }
  }

  /**
   * Get SAP connection status
   */
  async getConnectionStatus() {
    try {
      const response = await apiClient.get('/sap/status');
      this.isConnected = response.data.connected;
      this.connectionStatus = response.data.status;
      this.lastSyncTime = response.data.lastSync;
      return response.data;
    } catch (error) {
      console.error('Failed to get SAP status:', error);
      throw error;
    }
  }

  /**
   * Sync data from SAP
   * @param {Object} syncOptions - Sync configuration
   */
  async syncFromSAP(syncOptions = {}) {
    try {
      const response = await apiClient.post('/sap/sync', {
        direction: 'from_sap',
        ...syncOptions
      });
      this.lastSyncTime = new Date().toISOString();
      return response.data;
    } catch (error) {
      console.error('SAP sync failed:', error);
      throw error;
    }
  }

  /**
   * Push data to SAP
   * @param {Object} data - Data to push to SAP
   * @param {Object} options - Push options
   */
  async pushToSAP(data, options = {}) {
    try {
      const response = await apiClient.post('/sap/push', {
        data,
        direction: 'to_sap',
        ...options
      });
      return response.data;
    } catch (error) {
      console.error('SAP push failed:', error);
      throw error;
    }
  }

  /**
   * Get SAP master data (customers, products, etc.)
   * @param {string} dataType - Type of master data
   * @param {Object} filters - Filters to apply
   */
  async getMasterData(dataType, filters = {}) {
    try {
      const response = await apiClient.get(`/sap/master-data/${dataType}`, { params: filters });
      return response.data;
    } catch (error) {
      console.error(`Failed to get SAP ${dataType} data:`, error);
      throw error;
    }
  }

  /**
   * Sync specific data types
   */
  async syncCustomers() {
    return this.syncFromSAP({ dataTypes: ['customers'] });
  }

  async syncProducts() {
    return this.syncFromSAP({ dataTypes: ['products'] });
  }

  async syncSalesData() {
    return this.syncFromSAP({ dataTypes: ['sales'] });
  }

  async syncFinancialData() {
    return this.syncFromSAP({ dataTypes: ['financial'] });
  }

  /**
   * Get sync history
   */
  async getSyncHistory() {
    try {
      const response = await apiClient.get('/sap/sync-history');
      return response.data;
    } catch (error) {
      console.error('Failed to get sync history:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic sync
   * @param {Object} schedule - Sync schedule configuration
   */
  async scheduleSync(schedule) {
    try {
      const response = await apiClient.post('/sap/schedule-sync', schedule);
      return response.data;
    } catch (error) {
      console.error('Failed to schedule sync:', error);
      throw error;
    }
  }

  /**
   * Get SAP system information
   */
  async getSystemInfo() {
    try {
      const response = await apiClient.get('/sap/system-info');
      return response.data;
    } catch (error) {
      console.error('Failed to get SAP system info:', error);
      throw error;
    }
  }

  /**
   * Validate SAP data mapping
   * @param {Object} mapping - Field mapping configuration
   */
  async validateMapping(mapping) {
    try {
      const response = await apiClient.post('/sap/validate-mapping', mapping);
      return response.data;
    } catch (error) {
      console.error('SAP mapping validation failed:', error);
      throw error;
    }
  }

  /**
   * Get available SAP tables/views
   */
  async getAvailableTables() {
    try {
      const response = await apiClient.get('/sap/tables');
      return response.data;
    } catch (error) {
      console.error('Failed to get SAP tables:', error);
      throw error;
    }
  }

  /**
   * Execute custom SAP query
   * @param {string} query - SAP query to execute
   * @param {Object} parameters - Query parameters
   */
  async executeQuery(query, parameters = {}) {
    try {
      const response = await apiClient.post('/sap/query', { query, parameters });
      return response.data;
    } catch (error) {
      console.error('SAP query execution failed:', error);
      throw error;
    }
  }

  /**
   * Get data mapping configuration
   */
  async getMappingConfig() {
    try {
      const response = await apiClient.get('/sap/mapping-config');
      return response.data;
    } catch (error) {
      console.error('Failed to get mapping config:', error);
      throw error;
    }
  }

  /**
   * Update data mapping configuration
   * @param {Object} mappingConfig - New mapping configuration
   */
  async updateMappingConfig(mappingConfig) {
    try {
      const response = await apiClient.put('/sap/mapping-config', mappingConfig);
      return response.data;
    } catch (error) {
      console.error('Failed to update mapping config:', error);
      throw error;
    }
  }

  /**
   * Get sync conflicts
   */
  async getSyncConflicts() {
    try {
      const response = await apiClient.get('/sap/sync-conflicts');
      return response.data;
    } catch (error) {
      console.error('Failed to get sync conflicts:', error);
      throw error;
    }
  }

  /**
   * Resolve sync conflict
   * @param {string} conflictId - Conflict ID
   * @param {string} resolution - Resolution strategy ('use_sap', 'use_local', 'merge')
   */
  async resolveConflict(conflictId, resolution) {
    try {
      const response = await apiClient.post(`/sap/resolve-conflict/${conflictId}`, { resolution });
      return response.data;
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }

  // Helper methods
  isConnectionActive() {
    return this.isConnected && this.connectionStatus === 'connected';
  }

  getLastSyncTime() {
    return this.lastSyncTime;
  }

  getConnectionStatusDisplay() {
    const statusMap = {
      'connected': { text: 'Connected', color: 'success' },
      'disconnected': { text: 'Disconnected', color: 'error' },
      'connecting': { text: 'Connecting...', color: 'warning' },
      'failed': { text: 'Connection Failed', color: 'error' },
      'syncing': { text: 'Syncing...', color: 'info' }
    };
    return statusMap[this.connectionStatus] || { text: 'Unknown', color: 'default' };
  }

  // Predefined sync configurations
  getDefaultSyncConfig() {
    return {
      customers: {
        enabled: true,
        frequency: 'daily',
        tables: ['KNA1', 'KNVV'],
        fields: ['KUNNR', 'NAME1', 'STRAS', 'ORT01', 'PSTLZ', 'LAND1']
      },
      products: {
        enabled: true,
        frequency: 'daily',
        tables: ['MARA', 'MARC'],
        fields: ['MATNR', 'MAKTX', 'MTART', 'MEINS', 'WERKS']
      },
      sales: {
        enabled: true,
        frequency: 'hourly',
        tables: ['VBAK', 'VBAP'],
        fields: ['VBELN', 'AUDAT', 'KUNNR', 'NETWR', 'WAERK']
      }
    };
  }
}

// Create singleton instance
const sapService = new SAPService();

export default sapService;