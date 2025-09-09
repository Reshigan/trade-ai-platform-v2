import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Description as DescriptionIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon
} from '@mui/icons-material';

import { PageHeader } from '../common';

// Mock data for development
const mockReports = [
  {
    id: '1',
    name: 'Monthly Budget Performance',
    description: 'Overview of budget utilization and performance for the current month',
    type: 'budget',
    format: 'dashboard',
    lastRun: '2025-09-01T10:30:00Z',
    scheduled: true,
    frequency: 'monthly'
  },
  {
    id: '2',
    name: 'Trade Spend ROI Analysis',
    description: 'Analysis of return on investment for all trade spend activities',
    type: 'trade_spend',
    format: 'chart',
    lastRun: '2025-09-02T14:15:00Z',
    scheduled: false,
    frequency: null
  },
  {
    id: '3',
    name: 'Customer Performance Report',
    description: 'Detailed performance metrics for all customers',
    type: 'customer',
    format: 'table',
    lastRun: '2025-09-03T09:45:00Z',
    scheduled: true,
    frequency: 'weekly'
  },
  {
    id: '4',
    name: 'Product Sales Analysis',
    description: 'Sales performance analysis for all products',
    type: 'product',
    format: 'chart',
    lastRun: '2025-08-28T11:20:00Z',
    scheduled: true,
    frequency: 'weekly'
  },
  {
    id: '5',
    name: 'Promotion Effectiveness',
    description: 'Analysis of promotion effectiveness and ROI',
    type: 'promotion',
    format: 'dashboard',
    lastRun: '2025-09-01T16:10:00Z',
    scheduled: false,
    frequency: null
  },
  {
    id: '6',
    name: 'Executive Summary',
    description: 'High-level summary of key performance indicators for executives',
    type: 'summary',
    format: 'dashboard',
    lastRun: '2025-09-02T08:30:00Z',
    scheduled: true,
    frequency: 'monthly'
  }
];

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [scheduleFilter, setScheduleFilter] = useState('all');
  
  // Load reports data
  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For now, we'll use mock data
    setLoading(true);
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle filter menu open
  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  // Handle filter menu close
  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Handle type filter change
  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
    handleFilterMenuClose();
  };
  
  // Handle format filter change
  const handleFormatFilterChange = (format) => {
    setFormatFilter(format);
    handleFilterMenuClose();
  };
  
  // Handle schedule filter change
  const handleScheduleFilterChange = (schedule) => {
    setScheduleFilter(schedule);
    handleFilterMenuClose();
  };
  
  // Handle delete dialog open
  const handleDeleteDialogOpen = (report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };
  
  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle schedule dialog open
  const handleScheduleDialogOpen = (report) => {
    setSelectedReport(report);
    setScheduleDialogOpen(true);
  };
  
  // Handle schedule dialog close
  const handleScheduleDialogClose = () => {
    setScheduleDialogOpen(false);
  };
  
  // Handle export dialog open
  const handleExportDialogOpen = (report) => {
    setSelectedReport(report);
    setExportDialogOpen(true);
  };
  
  // Handle export dialog close
  const handleExportDialogClose = () => {
    setExportDialogOpen(false);
  };
  
  // Handle share dialog open
  const handleShareDialogOpen = (report) => {
    setSelectedReport(report);
    setShareDialogOpen(true);
  };
  
  // Handle share dialog close
  const handleShareDialogClose = () => {
    setShareDialogOpen(false);
  };
  
  // Handle delete report
  const handleDeleteReport = () => {
    // In a real app, we would call the API to delete the report
    setReports((prevReports) => prevReports.filter(report => report.id !== selectedReport.id));
    
    setSnackbar({
      open: true,
      message: `Report "${selectedReport.name}" has been deleted`,
      severity: 'success'
    });
    
    handleDeleteDialogClose();
  };
  
  // Handle schedule report
  const handleScheduleReport = (frequency) => {
    // In a real app, we would call the API to schedule the report
    setReports((prevReports) =>
      prevReports.map(report =>
        report.id === selectedReport.id
          ? { ...report, scheduled: true, frequency }
          : report
      )
    );
    
    setSnackbar({
      open: true,
      message: `Report "${selectedReport.name}" has been scheduled to run ${frequency}`,
      severity: 'success'
    });
    
    handleScheduleDialogClose();
  };
  
  // Handle export report
  const handleExportReport = (format) => {
    // In a real app, we would call the API to export the report
    setSnackbar({
      open: true,
      message: `Report "${selectedReport.name}" has been exported as ${format}`,
      severity: 'success'
    });
    
    handleExportDialogClose();
  };
  
  // Handle share report
  const handleShareReport = () => {
    // In a real app, we would call the API to share the report
    setSnackbar({
      open: true,
      message: `Report "${selectedReport.name}" has been shared`,
      severity: 'success'
    });
    
    handleShareDialogClose();
  };
  
  // Handle run report
  const handleRunReport = (report) => {
    // In a real app, we would call the API to run the report
    setSnackbar({
      open: true,
      message: `Report "${report.name}" is running...`,
      severity: 'info'
    });
    
    // Simulate report running
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: `Report "${report.name}" has completed`,
        severity: 'success'
      });
      
      // Update last run time
      setReports((prevReports) =>
        prevReports.map(r =>
          r.id === report.id
            ? { ...r, lastRun: new Date().toISOString() }
            : r
        )
      );
    }, 2000);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar((prevSnackbar) => ({
      ...prevSnackbar,
      open: false
    }));
  };
  
  // Filter reports based on search term and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesFormat = formatFilter === 'all' || report.format === formatFilter;
    const matchesSchedule = 
      scheduleFilter === 'all' || 
      (scheduleFilter === 'scheduled' && report.scheduled) ||
      (scheduleFilter === 'not_scheduled' && !report.scheduled);
    
    return matchesSearch && matchesType && matchesFormat && matchesSchedule;
  });
  
  // Get unique types, formats for filters
  const types = ['all', ...new Set(reports.map(report => report.type))];
  const formats = ['all', ...new Set(reports.map(report => report.format))];
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get icon for report format
  const getFormatIcon = (format) => {
    switch (format) {
      case 'dashboard':
        return <BarChartIcon />;
      case 'chart':
        return <ShowChartIcon />;
      case 'table':
        return <TableChartIcon />;
      default:
        return <DescriptionIcon />;
    }
  };
  
  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Generate, schedule, and manage reports"
      />
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          margin="dense"
          placeholder="Search reports..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 2, flexGrow: 1 }}
          value={searchTerm}
          onChange={handleSearch}
        />
        
        <Tooltip title="Filter reports">
          <IconButton onClick={handleFilterMenuOpen}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ ml: 2 }}
          href="/reports/new"
        >
          Create Report
        </Button>
      </Box>
      
      {/* Filter chips */}
      {(typeFilter !== 'all' || formatFilter !== 'all' || scheduleFilter !== 'all') && (
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {typeFilter !== 'all' && (
            <Chip
              label={`Type: ${typeFilter.replace('_', ' ')}`}
              onDelete={() => handleTypeFilterChange('all')}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
          
          {formatFilter !== 'all' && (
            <Chip
              label={`Format: ${formatFilter}`}
              onDelete={() => handleFormatFilterChange('all')}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
          
          {scheduleFilter !== 'all' && (
            <Chip
              label={`${scheduleFilter === 'scheduled' ? 'Scheduled' : 'Not Scheduled'}`}
              onDelete={() => handleScheduleFilterChange('all')}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredReports.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No reports found matching your criteria.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredReports.map((report) => (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>
                      {getFormatIcon(report.format)}
                    </Box>
                    <Box>
                      <Typography variant="h6" component="div">
                        {report.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.type.replace('_', ' ')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    {report.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={report.format}
                      size="small"
                      color={
                        report.format === 'dashboard' ? 'primary' :
                        report.format === 'chart' ? 'secondary' : 'default'
                      }
                      sx={{ mr: 1 }}
                    />
                    
                    {report.scheduled && (
                      <Chip
                        icon={<ScheduleIcon />}
                        label={report.frequency}
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Last run: {formatDate(report.lastRun)}
                  </Typography>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleRunReport(report)}
                  >
                    Run Now
                  </Button>
                  
                  <Button
                    size="small"
                    onClick={() => handleExportDialogOpen(report)}
                    startIcon={<DownloadIcon />}
                  >
                    Export
                  </Button>
                  
                  <Box sx={{ flexGrow: 1 }} />
                  
                  <Tooltip title="Schedule">
                    <IconButton
                      size="small"
                      onClick={() => handleScheduleDialogOpen(report)}
                    >
                      <ScheduleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Share">
                    <IconButton
                      size="small"
                      onClick={() => handleShareDialogOpen(report)}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDialogOpen(report)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Filter by Type</Typography>
        </MenuItem>
        {types.map((type) => (
          <MenuItem
            key={`type-${type}`}
            onClick={() => handleTypeFilterChange(type)}
            selected={typeFilter === type}
          >
            {type === 'all' ? 'All Types' : type.replace('_', ' ')}
          </MenuItem>
        ))}
        
        <MenuItem disabled>
          <Typography variant="subtitle2">Filter by Format</Typography>
        </MenuItem>
        {formats.map((format) => (
          <MenuItem
            key={`format-${format}`}
            onClick={() => handleFormatFilterChange(format)}
            selected={formatFilter === format}
          >
            {format === 'all' ? 'All Formats' : format}
          </MenuItem>
        ))}
        
        <MenuItem disabled>
          <Typography variant="subtitle2">Filter by Schedule</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleScheduleFilterChange('all')}
          selected={scheduleFilter === 'all'}
        >
          All Reports
        </MenuItem>
        <MenuItem
          onClick={() => handleScheduleFilterChange('scheduled')}
          selected={scheduleFilter === 'scheduled'}
        >
          Scheduled Reports
        </MenuItem>
        <MenuItem
          onClick={() => handleScheduleFilterChange('not_scheduled')}
          selected={scheduleFilter === 'not_scheduled'}
        >
          Non-Scheduled Reports
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the report "{selectedReport?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteReport} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Schedule Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={handleScheduleDialogClose}
      >
        <DialogTitle>Schedule Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set up a schedule for the report "{selectedReport?.name}".
          </DialogContentText>
          
          <List>
            <ListItem button onClick={() => handleScheduleReport('daily')}>
              <ListItemIcon>
                <ScheduleIcon />
              </ListItemIcon>
              <ListItemText primary="Daily" secondary="Run this report every day" />
            </ListItem>
            
            <ListItem button onClick={() => handleScheduleReport('weekly')}>
              <ListItemIcon>
                <ScheduleIcon />
              </ListItemIcon>
              <ListItemText primary="Weekly" secondary="Run this report every week" />
            </ListItem>
            
            <ListItem button onClick={() => handleScheduleReport('monthly')}>
              <ListItemIcon>
                <ScheduleIcon />
              </ListItemIcon>
              <ListItemText primary="Monthly" secondary="Run this report every month" />
            </ListItem>
            
            <ListItem button onClick={() => handleScheduleReport('quarterly')}>
              <ListItemIcon>
                <ScheduleIcon />
              </ListItemIcon>
              <ListItemText primary="Quarterly" secondary="Run this report every quarter" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={handleExportDialogClose}
      >
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose a format to export the report "{selectedReport?.name}".
          </DialogContentText>
          
          <List>
            <ListItem button onClick={() => handleExportReport('PDF')}>
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="PDF" secondary="Export as PDF document" />
            </ListItem>
            
            <ListItem button onClick={() => handleExportReport('Excel')}>
              <ListItemIcon>
                <TableChartIcon />
              </ListItemIcon>
              <ListItemText primary="Excel" secondary="Export as Excel spreadsheet" />
            </ListItem>
            
            <ListItem button onClick={() => handleExportReport('CSV')}>
              <ListItemIcon>
                <TableChartIcon />
              </ListItemIcon>
              <ListItemText primary="CSV" secondary="Export as CSV file" />
            </ListItem>
            
            <ListItem button onClick={() => handleExportReport('Image')}>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Image" secondary="Export as PNG image" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExportDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={handleShareDialogClose}
      >
        <DialogTitle>Share Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Share the report "{selectedReport?.name}" with others.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            label="Email Addresses"
            type="email"
            fullWidth
            variant="outlined"
            helperText="Separate multiple email addresses with commas"
            sx={{ mt: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Message (Optional)"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShareDialogClose}>Cancel</Button>
          <Button onClick={handleShareReport} color="primary">
            Share
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportList;