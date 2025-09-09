import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Warning as WarningIcon,
  Event as EventIcon,
  LocalOffer as PromotionIcon,
  AttachMoney as TradeSpendIcon,
  Campaign as CampaignIcon,
  School as TrainingIcon,
  MoreHoriz as OtherIcon
} from '@mui/icons-material';
import { 
  format, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isWeekend,
  parseISO,
  isSameDay
} from 'date-fns';
import { enZA } from 'date-fns/locale';

const ActivityGridCalendar = ({ 
  activities, 
  viewType, 
  startDate, 
  endDate, 
  onActivityClick,
  conflicts 
}) => {
  // Generate days for the calendar
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'promotion':
        return <PromotionIcon fontSize="small" />;
      case 'trade_spend':
        return <TradeSpendIcon fontSize="small" />;
      case 'campaign':
        return <CampaignIcon fontSize="small" />;
      case 'event':
        return <EventIcon fontSize="small" />;
      case 'training':
        return <TrainingIcon fontSize="small" />;
      default:
        return <OtherIcon fontSize="small" />;
    }
  };
  
  // Get activity color based on type
  const getActivityColor = (type) => {
    switch (type) {
      case 'promotion':
        return 'primary';
      case 'trade_spend':
        return 'success';
      case 'campaign':
        return 'secondary';
      case 'event':
        return 'info';
      case 'training':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Check if a day has conflicts
  const hasConflicts = (date) => {
    return conflicts.some(conflict => 
      isSameDay(parseISO(conflict.activity.date), date)
    );
  };
  
  // Get activities for a specific day
  const getDayActivities = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return activities[dateStr] || [];
  };
  
  return (
    <Box>
      {/* Calendar header - days of week */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Grid item xs={12/7} key={index}>
            <Box sx={{ 
              p: 1, 
              textAlign: 'center',
              fontWeight: 'bold',
              color: index === 0 || index === 6 ? 'text.secondary' : 'text.primary'
            }}>
              {day}
            </Box>
          </Grid>
        ))}
      </Grid>
      
      {/* Calendar grid */}
      <Grid container spacing={1}>
        {days.map((day, index) => {
          const dayActivities = getDayActivities(day);
          const isCurrentMonth = isSameMonth(day, startDate);
          const isCurrentDay = isToday(day);
          const isWeekendDay = isWeekend(day);
          const dayHasConflicts = hasConflicts(day);
          
          return (
            <Grid item xs={12/7} key={index}>
              <Paper 
                elevation={isCurrentDay ? 3 : 1}
                sx={{ 
                  p: 1, 
                  height: '120px',
                  bgcolor: isCurrentDay ? 'primary.light' : isWeekendDay ? 'grey.100' : 'background.paper',
                  opacity: isCurrentMonth ? 1 : 0.5,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isCurrentDay ? 'bold' : 'normal',
                      color: isCurrentDay ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    {format(day, 'd', { locale: enZA })}
                  </Typography>
                  
                  {dayHasConflicts && (
                    <Tooltip title="Conflicts detected">
                      <IconButton size="small" color="warning">
                        <WarningIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                
                <Box sx={{ overflowY: 'auto', maxHeight: '80px' }}>
                  {dayActivities.map((activity, actIndex) => (
                    <Chip
                      key={actIndex}
                      icon={getActivityIcon(activity.type)}
                      label={activity.title}
                      size="small"
                      color={getActivityColor(activity.type)}
                      onClick={() => onActivityClick(activity)}
                      sx={{ mb: 0.5, width: '100%', justifyContent: 'flex-start' }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ActivityGridCalendar;