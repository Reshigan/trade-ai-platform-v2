import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// Mock AI responses based on South African context
const getAIResponse = (message, context) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let response = '';
      
      // Default responses if no specific context
      const defaultResponses = [
        "I can help you analyze this data for the South African market. What specific insights are you looking for?",
        "Based on current trends in South Africa, I recommend focusing on these key areas...",
        "Would you like me to generate a forecast based on this data for the South African retail environment?",
        "I've analyzed your request in the context of South African consumer patterns. Here are some recommendations to consider..."
      ];
      
      // Context-specific responses for South African market
      const contextResponses = {
        'dashboard': [
          "Your dashboard shows a 15% increase in trade spend ROI compared to last quarter, outperforming the South African retail average by 3.2%.",
          "I notice seasonal fluctuations in your promotional spending pattern aligned with South African holidays. Would you like me to analyze this further?",
          "Based on your dashboard metrics, I recommend reallocating budget from underperforming promotions to your top performers at Shoprite and Pick n Pay."
        ],
        'budgets': [
          "Your current budget utilization is at 75%. You're on track to meet your annual targets despite ZAR currency fluctuations.",
          "I've analyzed your budget allocation and found potential optimization opportunities in the winter promotional calendar for South Africa.",
          "Would you like me to simulate different budget allocation scenarios across South African retail channels to maximize ROI?"
        ],
        'trade-spends': [
          "This trade spend with Shoprite has an estimated ROI of 3.2x based on historical performance in the South African market.",
          "Similar trade spends in this category typically perform 18% better when launched during South African winter months.",
          "I recommend adjusting the timing of this trade spend to align with South African seasonal buying patterns I've detected."
        ],
        'promotions': [
          "This promotion type has historically performed 25% better than average in South African retail environments.",
          "Based on my analysis of South African consumer behavior, extending this promotion through the Heritage Day period could increase returns by approximately 22%.",
          "I've detected a potential cannibalization risk between this promotion and your current winter campaign in the Western Cape region."
        ],
        'customers': [
          "Diplomat South Africa's response to trade promotions has increased by 15% year-over-year.",
          "I recommend a customized promotion strategy for Shoprite based on their unique purchase patterns in the South African market.",
          "South African retail customers show high sensitivity to price promotions during holiday periods but less response to volume incentives."
        ],
        'products': [
          "Biltong's promotional elasticity is 2.8, which is 45% higher than the South African snack category average.",
          "Based on my analysis, bundling Rooibos Tea with complementary South African products could increase basket size by 32%.",
          "I've identified seasonal patterns in Amarula's performance that could inform your promotional calendar for the South African market."
        ],
        'analytics': [
          "My analysis shows that your top-performing promotions in South Africa share these three characteristics...",
          "I've identified a potential opportunity to increase ROI by 18% in the Gauteng region by adjusting your promotional mix.",
          "Would you like me to generate a predictive model for South African consumer response to your winter promotions?"
        ],
        'settings': [
          "I can help you optimize your notification settings based on South African business hours and usage patterns.",
          "Based on your role managing the South African market, I recommend enabling these specific dashboard views and reports.",
          "Would you like me to suggest permission settings based on your South African organizational structure?"
        ],
        'companies': [
          "ZAR currency fluctuations have impacted trade spend effectiveness by approximately 8.5% this quarter.",
          "I recommend adjusting your trade terms with Diplomat South Africa to account for recent ZAR value changes.",
          "Based on my analysis of similar markets, South African distribution structures could be optimized for better trade spend efficiency."
        ]
      };
      
      // Select response based on context
      if (context && contextResponses[context]) {
        const contextSpecificResponses = contextResponses[context];
        response = contextSpecificResponses[Math.floor(Math.random() * contextSpecificResponses.length)];
      } else {
        response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      }
      
      // Add some personalization based on the user's message - South African context
      if (message.toLowerCase().includes('forecast')) {
        response = "I can generate a forecast based on your South African market data. My analysis suggests a growth trajectory of 9-14% for the next quarter, with stronger performance expected in Gauteng and Western Cape regions.";
      } else if (message.toLowerCase().includes('compare') || message.toLowerCase().includes('comparison')) {
        response = "I've compared the performance metrics across South African retail channels. The analysis shows Shoprite and Pick n Pay outperforming others by 18%, with promotional effectiveness varying significantly by region.";
      } else if (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggestion')) {
        response = "Based on my analysis of your South African market data, I recommend focusing on high-elasticity products like Biltong and Rooibos Tea, while optimizing your promotional calendar to align with South African holidays and seasonal patterns.";
      } else if (message.toLowerCase().includes('biltong') || message.toLowerCase().includes('rooibos') || message.toLowerCase().includes('amarula')) {
        response = "I've analyzed your South African specialty products. These items show 25-40% higher promotional elasticity than other categories and perform exceptionally well during holiday periods and tourist seasons.";
      } else if (message.toLowerCase().includes('shoprite') || message.toLowerCase().includes('pick n pay') || message.toLowerCase().includes('woolworths') || message.toLowerCase().includes('spar')) {
        response = "Your data shows varying performance across South African retail chains. Shoprite and Pick n Pay respond best to price promotions, while Woolworths customers show stronger response to premium product bundling and quality messaging.";
      } else if (message.toLowerCase().includes('rand') || message.toLowerCase().includes('zar') || message.toLowerCase().includes('currency')) {
        response = "I've analyzed the impact of ZAR fluctuations on your trade spend effectiveness. Recent currency movements have created both challenges and opportunities, particularly for imported product categories.";
      }
      
      resolve(response);
    }, 1500); // Simulate API delay
  });
};

const AIAssistant = ({ context = 'dashboard' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: `Hello! I'm your Trade AI Assistant for the South African market. How can I help you with your ${context} today?`,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);
    
    // Get AI response
    try {
      const response = await getAIResponse(newMessage, context);
      
      // Add AI response
      const aiMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      { 
        id: 1, 
        sender: 'ai', 
        text: `Hello! I'm your Trade AI Assistant for the South African market. How can I help you with your ${context} today?`,
        timestamp: new Date()
      }
    ]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating button to open chat */}
      <Tooltip title="AI Assistant" placement="left">
        <Fab
          color="primary"
          aria-label="AI Assistant"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000
          }}
          onClick={() => setIsOpen(true)}
        >
          <SmartToyIcon />
        </Fab>
      </Tooltip>

      {/* Chat drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%'
          }
        }}
      >
        {/* Chat header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            backgroundColor: 'primary.main',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToyIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Trade AI Assistant</Typography>
          </Box>
          <Box>
            <Tooltip title="Clear conversation">
              <IconButton color="inherit" onClick={clearConversation}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <IconButton color="inherit" onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Chat messages */}
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: 'auto',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: 'calc(100vh - 140px)'
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '100%'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                    width: 32,
                    height: 32
                  }}
                >
                  {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    maxWidth: '80%',
                    backgroundColor: message.sender === 'user' ? 'primary.light' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      textAlign: message.sender === 'user' ? 'right' : 'left',
                      opacity: 0.7
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          ))}
          
          {isTyping && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  width: 32,
                  height: 32
                }}
              >
                <SmartToyIcon />
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CircularProgress size={12} />
                  <Typography variant="body2">AI is typing...</Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Chat input */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask me anything..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            multiline
            maxRows={3}
            disabled={isTyping}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={newMessage.trim() === '' || isTyping}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Drawer>
    </>
  );
};

export default AIAssistant;