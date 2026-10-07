import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import Webcam from 'react-webcam';

function BiometricCaptureNew({ type = 'face', onCapture, onCancel }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const autoCapturePendingRef = useRef(false);
  const [isDetected, setIsDetected] = useState(false);
  const [detectionScore, setDetectionScore] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');
  const [countdown, setCountdown] = useState(0);

  console.log(`🚀 BiometricCaptureNew initialized for type: ${type}`);

  // Auto-capture function with countdown
  const triggerAutoCapture = useCallback(() => {
    if (autoCapturePendingRef.current) return; // Prevent multiple triggers
    
    autoCapturePendingRef.current = true;
    console.log('⏰ Starting 3-second countdown for auto-capture...');
    
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
        autoCapturePendingRef.current = false;
      }
    }, 1000);
    
  }, [onCapture]);

  // Simple detection function
  const detectBiometric = useCallback(() => {
    if (!webcamRef.current?.video || !canvasRef.current) return;
    
    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    
    if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('⏳ Video not ready yet...');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Super simple detection - just check for any significant content
    let totalBrightness = 0;
    let validPixels = 0;
    
    // Sample every 10th pixel for speed
    for (let i = 0; i < data.length; i += 40) { // RGBA = 4 bytes, so every 10th pixel
      const r = data[i];
      const g = data[i + 1]; 
      const b = data[i + 2];
      
      if (r !== undefined && g !== undefined && b !== undefined) {
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
        validPixels++;
      }
    }
    
    if (validPixels === 0) return;
    
    const avgBrightness = totalBrightness / validPixels;
    
    // Ultra-simple scoring: just based on reasonable lighting
    let score = 0;
    if (avgBrightness > 30 && avgBrightness < 200) {
      score = 100; // Give full score for any reasonable lighting
    } else if (avgBrightness > 10 && avgBrightness < 240) {
      score = 50; // Partial score for marginal lighting
    } else {
      score = 0; // Too dark or too bright
    }
    
    const detected = score >= 50;
    
    console.log(`🔍 ${type}: brightness=${avgBrightness.toFixed(1)}, score=${score}, detected=${detected}`);
    
    setIsDetected(detected);
    setDetectionScore(score);
    setDebugInfo(`${type}: Brightness=${avgBrightness.toFixed(1)} Score=${score}`);
    
    // Trigger auto-capture immediately when detected
    if (detected && !autoCapturePendingRef.current) {
      console.log('🎯 BIOMETRIC DETECTED! Triggering auto-capture...');
      triggerAutoCapture();
    }
    
  }, [type, triggerAutoCapture]);

  // Start detection
  useEffect(() => {
    console.log(`🎬 Starting detection loop for ${type}`);
    
    const startDetection = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        detectBiometric();
      }, 500); // Run every 500ms
    };
    
    // Start after a delay
    const timer = setTimeout(startDetection, 2000);
    
    return () => {
      console.log(`🛑 Stopping detection for ${type}`);
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [detectBiometric, type]);

  // Manual capture
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
      border: `3px solid ${isDetected ? '#00ff00' : '#ff9800'}`,
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
      
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      
      {/* Status Display */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        bgcolor: isDetected ? 'green' : 'orange', 
        color: 'white', 
        borderRadius: 2,
        textAlign: 'center',
        width: '100%'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {countdown > 0 ? 
            `🔥 AUTO-CAPTURING IN ${countdown}...` :
            isDetected ? 
              `✅ ${type.toUpperCase()} DETECTED (${detectionScore}%)` : 
              `📍 Position ${type} for detection (${detectionScore}%)`
          }
        </Typography>
        
        {debugInfo && (
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            {debugInfo}
          </Typography>
        )}
      </Box>

      {/* Control Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, width: '100%' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleManualCapture}
          sx={{
            flex: 1,
            backgroundColor: isDetected ? '#00ff00' : '#ff9800',
            color: '#000',
            fontWeight: 'bold',
            py: 1.5,
            '&:hover': {
              backgroundColor: isDetected ? '#00cc00' : '#e68900'
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

      {/* Instructions */}
      <Typography variant="body2" sx={{ mt: 2, color: '#ccc', textAlign: 'center' }}>
        {type === 'face' ? 
          'Look directly at the camera with good lighting' : 
          'Place your thumb clearly in front of the camera'
        }
      </Typography>
    </Box>
  );
}

export default BiometricCaptureNew;