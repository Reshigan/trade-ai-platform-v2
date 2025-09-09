import React from 'react';
import { Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';

/**
 * StatusChip component for displaying status with appropriate colors and icons
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Status value
 * @param {Object} props.customStatuses - Custom status configurations
 */
const StatusChip = ({ status, customStatuses = {}, ...props }) => {
  // Default status configurations
  const defaultStatuses = {
    active: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Active' },
    inactive: { color: 'default', icon: <CancelIcon fontSize="small" />, label: 'Inactive' },
    pending: { color: 'warning', icon: <PendingIcon fontSize="small" />, label: 'Pending' },
    processing: { color: 'info', icon: <HourglassEmptyIcon fontSize="small" />, label: 'Processing' },
    error: { color: 'error', icon: <ErrorIcon fontSize="small" />, label: 'Error' },
    paused: { color: 'default', icon: <PauseIcon fontSize="small" />, label: 'Paused' },
    running: { color: 'success', icon: <PlayArrowIcon fontSize="small" />, label: 'Running' },
    archived: { color: 'default', icon: <ArchiveIcon fontSize="small" />, label: 'Archived' },
    approved: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Approved' },
    rejected: { color: 'error', icon: <CancelIcon fontSize="small" />, label: 'Rejected' },
    draft: { color: 'default', icon: <PendingIcon fontSize="small" />, label: 'Draft' },
    planned: { color: 'info', icon: <PendingIcon fontSize="small" />, label: 'Planned' },
    completed: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Completed' },
    cancelled: { color: 'error', icon: <CancelIcon fontSize="small" />, label: 'Cancelled' },
  };

  // Merge default and custom statuses
  const statusConfigs = { ...defaultStatuses, ...customStatuses };
  
  // Get status configuration or use default
  const statusConfig = statusConfigs[status.toLowerCase()] || {
    color: 'default',
    icon: null,
    label: status
  };

  return (
    <Chip
      label={statusConfig.label}
      color={statusConfig.color}
      icon={statusConfig.icon}
      size="small"
      {...props}
    />
  );
};

export default StatusChip;