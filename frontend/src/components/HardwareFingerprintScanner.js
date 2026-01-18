import React, { useState, useEffect } from 'react';
import { Box, Button, Alert, CircularProgress, Typography, Chip } from '@mui/material';
import { Fingerprint, CheckCircle, Error, Info } from '@mui/icons-material';
import { isBiometricAvailable, registerFingerprint, authenticateFingerprint, convertWebAuthnToImage } from '../utils/webauthn';

function HardwareFingerprintScanner({ onCapture, username = 'user', mode = 'register' }) {
  const [isAvailable, setIsAvailable] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const available = await isBiometricAvailable();
    setIsAvailable(available);
  };

  const handleScan = async () => {
    setScanning(true);
    setError('');
    setSuccess(false);

    try {
      let credentialData;
      
      if (mode === 'register') {
        credentialData = await registerFingerprint(username);
      } else {
        credentialData = await authenticateFingerprint();
      }

      // Convert WebAuthn data to image format for backend compatibility
      const fingerprintImage = convertWebAuthnToImage(credentialData);
      
      setSuccess(true);
      onCapture(fingerprintImage, credentialData);
      
    } catch (err) {
      console.error('Hardware scan error:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('❌ Cancelled. To use fingerprint: 1) Open Windows Settings, 2) Go to Accounts → Sign-in options, 3) Set up Fingerprint recognition (Windows Hello), 4) Try again. Or click "Use Camera/Upload Instead" below.');
      } else if (err.name === 'NotSupportedError') {
        setError('❌ Not supported in this browser. Use Chrome or Edge, or click "Use Camera/Upload Instead" below.');
      } else if (err.name === 'InvalidStateError') {
        setError('❌ No fingerprint enrolled. Set up Windows Hello Fingerprint in Windows Settings first, or click "Use Camera/Upload Instead" below.');
      } else if (err.message && err.message.includes('The operation either timed out or was not allowed')) {
        setError('⚠️ Windows Hello not configured. Set up Fingerprint in Windows Settings → Accounts → Sign-in options. Or click "Use Camera/Upload Instead" below.');
      } else {
        setError(`❌ ${err.message || 'Setup Windows Hello Fingerprint in Settings, or use Camera/Upload option below.'}`);
      }
    } finally {
      setScanning(false);
    }
  };

  if (isAvailable === null) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CircularProgress size={30} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Checking for fingerprint scanner...
        </Typography>
      </Box>
    );
  }

  if (!isAvailable) {
    return (
      <Alert severity="warning" icon={<Info />} sx={{ borderRadius: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Hardware scanner not available</strong>
        </Typography>
        <Typography variant="caption">
          Please ensure:
          <br />• Windows Hello is set up (Settings → Accounts → Sign-in options)
          <br />• Your fingerprint is enrolled in Windows Hello
          <br />• You're using a supported browser (Chrome, Edge, Firefox)
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {success && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2, borderRadius: 2 }}>
          Fingerprint scanned successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" icon={<Error />} sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ 
        textAlign: 'center',
        p: 3,
        border: '2px dashed #667eea',
        borderRadius: 2,
        mb: 2,
        background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)'
      }}>
        <Fingerprint sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Use Windows Hello
        </Typography>
        <Chip 
          icon={<CheckCircle />}
          label="Biometric Available" 
          color="success" 
          size="small"
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Click button below → Windows will prompt for your fingerprint
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Make sure your fingerprint sensor is clean and dry
        </Typography>
        
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleScan}
          disabled={scanning}
          startIcon={scanning ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Fingerprint />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 600,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(102,126,234,0.4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {scanning ? 'Place Your Finger on Scanner...' : 'Scan Thumbprint Now'}
        </Button>
      </Box>

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="caption">
          <strong>First time setup:</strong> Go to Windows Settings → Accounts → Sign-in options → Fingerprint recognition (Windows Hello) → Set up. 
          Then come back and click "Scan Thumbprint Now".
          {mode === 'authenticate' && ' If not enrolled during registration, use camera/upload instead.'}
        </Typography>
      </Alert>
    </Box>
  );
}

export default HardwareFingerprintScanner;
