import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from '../../company/interfaces/company.interface';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class SAPIntegrationService {
  private readonly logger = new Logger(SAPIntegrationService.name);

  constructor(
    @InjectModel('Company') private companyModel: Model<Company>
  ) {}

  async connectToSAPSystem(companyId: string) {
    const company = await this.companyModel.findById(companyId);
    
    if (!company || !company.integrations.sap) {
      throw new Error('SAP integration not configured for this company');
    }

    const { type, endpoint, username, encryptedPassword, connectionType } = company.integrations.sap;
    const decryptedPassword = this.decryptPassword(encryptedPassword);

    try {
      // Establish connection based on SAP system type
      switch (type) {
        case 'ecc':
          return this.connectToSAPECC(endpoint, username, decryptedPassword);
        case 'hana':
          return this.connectToSAPHANA(endpoint, username, decryptedPassword);
        default:
          throw new Error('Unsupported SAP system type');
      }
    } catch (error) {
      this.logger.error(`SAP Connection Error: ${error.message}`);
      throw error;
    }
  }

  async fetchMasterData(companyId: string, dataType: 'products' | 'customers' | 'sales') {
    const connection = await this.connectToSAPSystem(companyId);

    try {
      switch (dataType) {
        case 'products':
          return this.fetchSAPProducts(connection);
        case 'customers':
          return this.fetchSAPCustomers(connection);
        case 'sales':
          return this.fetchSAPSalesData(connection);
        default:
          throw new Error('Invalid data type');
      }
    } catch (error) {
      this.logger.error(`Master Data Fetch Error: ${error.message}`);
      throw error;
    }
  }

  async syncDataToTradeAI(companyId: string, dataType: string, data: any[]) {
    // Implement data synchronization logic
    // This would involve mapping SAP data to Trade AI's data models
    const syncedData = data.map(item => this.mapSAPDataToTradeAI(item, dataType));

    // Save synced data to appropriate collections
    switch (dataType) {
      case 'products':
        // Save to Product collection
        break;
      case 'customers':
        // Save to Customer collection
        break;
      case 'sales':
        // Save to Sales collection
        break;
    }

    return syncedData;
  }

  private async connectToSAPECC(endpoint: string, username: string, password: string) {
    // Implement SAP ECC connection logic
    // This might use SAP's RFC library or REST API
    const connection = await axios.post(`${endpoint}/sap/connection`, {
      username,
      password
    });

    return connection.data;
  }

  private async connectToSAPHANA(endpoint: string, username: string, password: string) {
    // Implement SAP HANA connection logic
    const connection = await axios.post(`${endpoint}/hana/connection`, {
      username,
      password
    });

    return connection.data;
  }

  private async fetchSAPProducts(connection: any) {
    // Fetch product master data from SAP
    const productsResponse = await axios.get(`${connection.endpoint}/products`, {
      headers: { Authorization: `Bearer ${connection.token}` }
    });

    return productsResponse.data;
  }

  private async fetchSAPCustomers(connection: any) {
    // Fetch customer master data from SAP
    const customersResponse = await axios.get(`${connection.endpoint}/customers`, {
      headers: { Authorization: `Bearer ${connection.token}` }
    });

    return customersResponse.data;
  }

  private async fetchSAPSalesData(connection: any) {
    // Fetch sales data from SAP
    const salesResponse = await axios.get(`${connection.endpoint}/sales`, {
      headers: { Authorization: `Bearer ${connection.token}` }
    });

    return salesResponse.data;
  }

  private mapSAPDataToTradeAI(sapData: any, dataType: string) {
    // Implement data mapping logic
    switch (dataType) {
      case 'products':
        return {
          sapId: sapData.MATNR,
          name: sapData.MAKTX,
          category: sapData.MATKL,
          // Map other relevant fields
        };
      case 'customers':
        return {
          sapId: sapData.KUNNR,
          name: sapData.NAME1,
          type: sapData.KTOKD,
          // Map other relevant fields
        };
      case 'sales':
        return {
          sapSalesDocument: sapData.VBELN,
          product: sapData.MATNR,
          customer: sapData.KUNNR,
          quantity: sapData.KWMENG,
          value: sapData.NETWR,
          // Map other relevant fields
        };
      default:
        return sapData;
    }
  }

  private decryptPassword(encryptedPassword: string): string {
    try {
      const [keyHex, ivHex, encryptedHex] = encryptedPassword.split(':');
      
      const key = Buffer.from(keyHex, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error('Password decryption failed');
      throw new Error('Invalid encrypted password');
    }
  }
}