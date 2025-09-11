import apiClient from '../api/apiClient';

/**
 * AI Chatbot Service - Works with MongoDB data and local ML models
 * No external API dependencies (OpenAI, etc.)
 */
class ChatbotService {
  constructor() {
    this.conversationHistory = [];
    this.isInitialized = false;
  }

  /**
   * Initialize chatbot with user context and company data
   */
  async initialize() {
    try {
      const response = await apiClient.get('/ai/chatbot/initialize');
      this.isInitialized = true;
      return response.data;
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
      throw error;
    }
  }

  /**
   * Send message to AI chatbot
   * @param {string} message - User message
   * @param {Object} context - Additional context (current page, selected data, etc.)
   */
  async sendMessage(message, context = {}) {
    try {
      const payload = {
        message,
        context,
        conversationHistory: this.conversationHistory.slice(-10), // Last 10 messages for context
        timestamp: new Date().toISOString()
      };

      const response = await apiClient.post('/ai/chatbot/message', payload);
      
      // Add to conversation history
      this.conversationHistory.push({
        type: 'user',
        message,
        timestamp: new Date().toISOString()
      });
      
      this.conversationHistory.push({
        type: 'assistant',
        message: response.data.response,
        timestamp: new Date().toISOString(),
        data: response.data.data || null
      });

      return response.data;
    } catch (error) {
      console.error('Failed to send message to chatbot:', error);
      throw error;
    }
  }

  /**
   * Ask about specific data (promotions, customers, products, etc.)
   * @param {string} dataType - Type of data to query
   * @param {Object} filters - Filters to apply
   * @param {string} question - Specific question about the data
   */
  async askAboutData(dataType, filters = {}, question = '') {
    try {
      const payload = {
        dataType,
        filters,
        question,
        conversationHistory: this.conversationHistory.slice(-5)
      };

      const response = await apiClient.post('/ai/chatbot/data-query', payload);
      
      // Add to conversation history
      this.conversationHistory.push({
        type: 'user',
        message: `Tell me about ${dataType}: ${question}`,
        timestamp: new Date().toISOString()
      });
      
      this.conversationHistory.push({
        type: 'assistant',
        message: response.data.response,
        timestamp: new Date().toISOString(),
        data: response.data.data,
        charts: response.data.charts || null
      });

      return response.data;
    } catch (error) {
      console.error('Failed to query data:', error);
      throw error;
    }
  }

  /**
   * Get AI insights and recommendations
   * @param {string} type - Type of insights (performance, optimization, trends, etc.)
   * @param {Object} parameters - Parameters for the analysis
   */
  async getInsights(type, parameters = {}) {
    try {
      const payload = {
        type,
        parameters,
        userContext: {
          companyId: this.getCompanyId(),
          role: this.getUserRole()
        }
      };

      const response = await apiClient.post('/ai/chatbot/insights', payload);
      
      // Add to conversation history
      this.conversationHistory.push({
        type: 'user',
        message: `Show me ${type} insights`,
        timestamp: new Date().toISOString()
      });
      
      this.conversationHistory.push({
        type: 'assistant',
        message: response.data.response,
        timestamp: new Date().toISOString(),
        insights: response.data.insights,
        recommendations: response.data.recommendations
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get insights:', error);
      throw error;
    }
  }

  /**
   * Generate reports using AI
   * @param {string} reportType - Type of report to generate
   * @param {Object} parameters - Report parameters
   */
  async generateReport(reportType, parameters = {}) {
    try {
      const payload = {
        reportType,
        parameters,
        format: 'summary' // Can be 'summary', 'detailed', 'charts'
      };

      const response = await apiClient.post('/ai/chatbot/generate-report', payload);
      
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get suggested questions based on current context
   * @param {Object} context - Current page/data context
   */
  async getSuggestedQuestions(context = {}) {
    try {
      const response = await apiClient.post('/ai/chatbot/suggested-questions', { context });
      return response.data.questions || [];
    } catch (error) {
      console.error('Failed to get suggested questions:', error);
      return [];
    }
  }

  /**
   * Search data using natural language
   * @param {string} query - Natural language search query
   */
  async searchData(query) {
    try {
      const response = await apiClient.post('/ai/chatbot/search', { query });
      return response.data;
    } catch (error) {
      console.error('Failed to search data:', error);
      throw error;
    }
  }

  // Helper methods
  getCompanyId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.companyId || null;
  }

  getUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'user';
  }

  // Predefined question templates
  getQuestionTemplates() {
    return {
      promotions: [
        "What are my top performing promotions this month?",
        "Which promotions have the highest ROI?",
        "Show me promotions that are underperforming",
        "What's the total budget allocated for active promotions?"
      ],
      customers: [
        "Who are my top customers by revenue?",
        "Which customers have the most promotions?",
        "Show me customer performance trends",
        "Which customers need attention?"
      ],
      products: [
        "What are my best-selling products?",
        "Which products have the highest margins?",
        "Show me product performance by category",
        "Which products are declining in sales?"
      ],
      analytics: [
        "Show me this month's performance summary",
        "What are the key trends I should know about?",
        "How is my budget utilization?",
        "What opportunities should I focus on?"
      ]
    };
  }
}

// Create singleton instance
const chatbotService = new ChatbotService();

export default chatbotService;