import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * FormDialog component for form dialogs
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onClose - Function to call when the dialog is closed
 * @param {function} props.onSubmit - Function to call when the form is submitted
 * @param {string} props.title - Dialog title
 * @param {React.ReactNode} props.children - Dialog content
 * @param {string} props.submitText - Text for the submit button
 * @param {string} props.cancelText - Text for the cancel button
 * @param {boolean} props.loading - Whether the submit action is loading
 * @param {boolean} props.fullWidth - Whether the dialog should take up the full width
 * @param {string} props.maxWidth - Maximum width of the dialog
 * @param {boolean} props.disableSubmit - Whether the submit button should be disabled
 */
const FormDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  fullWidth = true,
  maxWidth = 'sm',
  disableSubmit = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title" sx={{ m: 0, p: 2 }}>
        {title}
        {!loading && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
          color="inherit"
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onSubmit} 
          color="primary" 
          variant="contained" 
          disabled={loading || disableSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Processing...' : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;