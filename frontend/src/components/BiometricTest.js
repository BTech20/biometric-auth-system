import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Webcam from 'react-webcam';

function BiometricTest({ type = 'face', onCapture, onCancel }) {
  const webcamRef = useRef(null);
  const [countdown, setCountdown] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  console.log(`🚀 BiometricTest started for ${type}`);

  // Auto-trigger after 5 seconds regardless of detection
  useEffect(() => {
    console.log('⏰ Starting 5-second auto-capture timer...');
    
    const timer = setTimeout(() => {
      console.log('🎯 Auto-triggering capture...');
      setIsRunning(true);
      
      let count = 3;
      setCountdown(count);
      
      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);
        console.log(`⏰ Auto-capture in: ${count}`);
        
        if (count <= 0) {
          clearInterval(countdownInterval);
          setCountdown(0);
          
          if (webcamRef.current && onCapture) {
            const imageSrc = webcamRef.current.getScreenshot();
            console.log('📸 AUTO-CAPTURED!', imageSrc ? 'Success' : 'Failed');
            if (imageSrc) {
              onCapture(imageSrc);
            }
          }
        }
      }, 1000);
      
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onCapture]);

  const handleManualCapture = () => {
    if (webcamRef.current && onCapture) {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log('📸 MANUAL CAPTURE:', imageSrc ? 'Success' : 'Failed');
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      border: `3px solid ${isRunning ? '#00ff00' : '#ff9800'}`,
      borderRadius: 2,
      p: 2,
      bgcolor: '#000'
    }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        style={{
          width: '100%',
          maxWidth: 400,
          height: 'auto',
          borderRadius: '8px'
        }}
      />
      
      {/* Status Display */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        bgcolor: isRunning ? 'green' : 'orange', 
        color: 'white', 
        borderRadius: 2,
        textAlign: 'center',
        width: '100%'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {countdown > 0 ? 
            `🔥 AUTO-CAPTURING IN ${countdown}...` :
            isRunning ? 
              '✅ AUTO-CAPTURE ACTIVATED!' : 
              `📍 Auto-capture will start in 5 seconds for ${type.toUpperCase()}`
          }
        </Typography>
      </Box>

      {/* Control Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, width: '100%' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleManualCapture}
          sx={{
            flex: 1,
            backgroundColor: '#ff9800',
            color: '#000',
            fontWeight: 'bold',
            py: 1.5,
            '&:hover': {
              backgroundColor: '#e68900'
            }
          }}
        >
          📸 Manual Capture
        </Button>
        <Button 
          variant="outlined" 
          size="large"
          onClick={onCancel}
          sx={{ 
            flex: 1,
            borderColor: '#ff4444',
            color: '#ff4444',
            py: 1.5,
            '&:hover': {
              borderColor: '#ff4444',
              bgcolor: 'rgba(255,68,68,0.1)'
            }
          }}
        >
          Cancel
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 2, color: '#ccc', textAlign: 'center' }}>
        🧪 TEST MODE: Auto-capture will trigger after 5 seconds regardless of detection
      </Typography>
    </Box>
  );
}

export default BiometricTest;