import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Webcam from 'react-webcam';

function WorkingBiometricCapture({ type = 'face', onCapture, onCancel }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const captureTimeoutRef = useRef(null);
  
  const [isDetected, setIsDetected] = useState(false);
  const [detectionScore, setDetectionScore] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  console.log(`🚀 WorkingBiometricCapture loaded for ${type}`);

  // Simple working detection function
  const runDetection = useCallback(() => {
    try {
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;
      
      if (!video || !canvas || video.readyState !== 4) {
        return false;
      }

      // Set canvas size
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      if (canvas.width === 0 || canvas.height === 0) {
        return false;
      }

      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Simple detection: calculate average brightness and activity
      let totalBrightness = 0;
      let activePixels = 0;
      let pixelCount = 0;
      
      // Sample every 20th pixel for performance
      for (let i = 0; i < pixels.length; i += 80) { // 80 = 20 pixels * 4 bytes (RGBA)
        const r = pixels[i] || 0;
        const g = pixels[i + 1] || 0;
        const b = pixels[i + 2] || 0;
        
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
        pixelCount++;
        
        // Consider pixel "active" if it has reasonable color values
        if (brightness > 20 && brightness < 220 && (r + g + b) > 60) {
          activePixels++;
        }
      }
      
      if (pixelCount === 0) return false;
      
      const avgBrightness = totalBrightness / pixelCount;
      const activityRatio = activePixels / pixelCount;
      
      // Calculate detection score (0-100)
      let score = 0;
      
      // Good lighting range
      if (avgBrightness > 40 && avgBrightness < 200) {
        score += 60;
      } else if (avgBrightness > 20 && avgBrightness < 240) {
        score += 30;
      }
      
      // Activity/content detection
      if (activityRatio > 0.4) {
        score += 40;
      } else if (activityRatio > 0.2) {
        score += 20;
      }
      
      const detected = score >= 60; // Reasonable threshold
      
      setDetectionScore(score);
      setIsDetected(detected);
      
      console.log(`🔍 ${type}: brightness=${avgBrightness.toFixed(1)}, activity=${(activityRatio*100).toFixed(1)}%, score=${score}, detected=${detected}`);
      
      return detected;
      
    } catch (error) {
      console.error('❌ Detection error:', error);
      return false;
    }
  }, [type]);

  // Auto-capture with countdown
  const startAutoCapture = useCallback(() => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    console.log('🎯 Starting auto-capture countdown...');
    
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      console.log(`⏰ Auto-capture in: ${count}s`);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        setCountdown(0);
        
        // Perform capture
        if (webcamRef.current && onCapture) {
          const screenshot = webcamRef.current.getScreenshot();
          console.log('📸 AUTO-CAPTURE EXECUTED!', screenshot ? 'Success' : 'Failed');
          
          if (screenshot) {
            onCapture(screenshot);
          }
        }
        
        setIsCapturing(false);
      }
    }, 1000);
    
    // Store reference to clear on unmount
    captureTimeoutRef.current = countdownInterval;
    
  }, [onCapture, isCapturing]);

  // Detection loop
  useEffect(() => {
    console.log(`🎬 Starting detection loop for ${type}`);
    
    let consecutiveDetections = 0;
    
    const detectionLoop = () => {
      const detected = runDetection();
      
      if (detected) {
        consecutiveDetections++;
        console.log(`✅ Detection ${consecutiveDetections}/2`);
        
        // Trigger auto-capture after 2 consecutive detections
        if (consecutiveDetections >= 2 && !isCapturing) {
          startAutoCapture();
        }
      } else {
        consecutiveDetections = 0;
      }
    };
    
    // Start detection after 1 second delay
    const startDelay = setTimeout(() => {
      detectionIntervalRef.current = setInterval(detectionLoop, 500); // Run every 500ms
      console.log('🔄 Detection interval started');
    }, 1000);
    
    // Cleanup function
    return () => {
      console.log(`🛑 Cleaning up detection for ${type}`);
      clearTimeout(startDelay);
      
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      
      if (captureTimeoutRef.current) {
        clearInterval(captureTimeoutRef.current);
        captureTimeoutRef.current = null;
      }
    };
  }, [type, runDetection, startAutoCapture, isCapturing]);

  // Manual capture
  const handleManualCapture = () => {
    if (webcamRef.current && onCapture) {
      const screenshot = webcamRef.current.getScreenshot();
      console.log('📸 MANUAL CAPTURE:', screenshot ? 'Success' : 'Failed');
      if (screenshot) {
        onCapture(screenshot);
      }
    }
  };

  const borderColor = countdown > 0 ? '#ff0000' : isDetected ? '#00ff00' : '#ff9800';
  const statusColor = countdown > 0 ? 'red' : isDetected ? 'green' : 'orange';

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 500,
      margin: '0 auto',
      border: `4px solid ${borderColor}`,
      borderRadius: 3,
      overflow: 'hidden',
      bgcolor: '#000'
    }}>
      {/* Video */}
      <Box sx={{ position: 'relative' }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          style={{
            width: '100%',
            display: 'block'
          }}
        />
        
        {/* Hidden canvas for detection */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        
        {/* Overlay guides */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          {type === 'face' ? (
            <Box sx={{
              width: '60%',
              height: '70%',
              border: `3px solid ${borderColor}`,
              borderRadius: '50%',
              opacity: 0.8
            }} />
          ) : (
            <Box sx={{
              width: '50%',
              height: '50%',
              border: `3px solid ${borderColor}`,
              borderRadius: '50%',
              opacity: 0.8
            }} />
          )}
        </Box>
      </Box>
      
      {/* Status Display */}
      <Box sx={{
        p: 2,
        bgcolor: statusColor,
        color: 'white',
        textAlign: 'center'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {countdown > 0 ? (
            `🔥 AUTO-CAPTURING IN ${countdown}...`
          ) : isDetected ? (
            `✅ ${type.toUpperCase()} DETECTED! (${detectionScore}%)`
          ) : (
            `📍 Position ${type} in guide (${detectionScore}%)`
          )}
        </Typography>
        
        {isDetected && countdown === 0 && (
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Auto-capture will trigger after stable detection...
          </Typography>
        )}
      </Box>
      
      {/* Controls */}
      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleManualCapture}
          disabled={isCapturing}
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            bgcolor: isDetected ? 'success.main' : 'warning.main',
            '&:hover': {
              bgcolor: isDetected ? 'success.dark' : 'warning.dark'
            }
          }}
        >
          📸 {isCapturing ? 'Capturing...' : 'Manual Capture'}
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          size="large" 
          onClick={onCancel}
          disabled={isCapturing}
          sx={{ 
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderColor: 'error.main',
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.main',
              color: 'white'
            }
          }}
        >
          ❌ Cancel
        </Button>
      </Box>
    </Box>
  );
}

export default WorkingBiometricCapture;