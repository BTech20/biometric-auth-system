import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Typography, ButtonGroup, Button, Alert } from '@mui/material';
import Webcam from 'react-webcam';

function BiometricCapture({ type = 'face', onCapture, onCancel }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [isDetected, setIsDetected] = useState(false);
  const [detectionScore, setDetectionScore] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');

  console.log(`BiometricCapture initialized for type: ${type}`);

  // Simple and reliable detection function
  const performDetection = useCallback(() => {
    try {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        webcamRef.current.video.videoWidth > 0 &&
        webcamRef.current.video.videoHeight > 0
      ) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        
        if (!canvas) {
          console.log('❌ Canvas not available');
          return;
        }
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (canvas.width <= 0 || canvas.height <= 0) {
          console.log(`❌ Invalid canvas dimensions: ${canvas.width}x${canvas.height}`);
          return;
        }
        
        console.log(`🎥 Processing ${type} detection: ${canvas.width}x${canvas.height}`);
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        if (type === 'face') {
          detectFaceSimple(data, canvas.width, canvas.height);
        } else {
          detectThumbSimple(data, canvas.width, canvas.height);
        }
        
      } else {
        const readyState = webcamRef.current?.video?.readyState || 'no video';
        const videoWidth = webcamRef.current?.video?.videoWidth || 0;
        const videoHeight = webcamRef.current?.video?.videoHeight || 0;
        console.log(`⏳ Video not ready - State: ${readyState}, Dimensions: ${videoWidth}x${videoHeight}`);
      }
    } catch (error) {
      console.error('💥 Detection error:', error);
      setDebugInfo(`Error: ${error.message}`);
    }
  }, [type, detectFaceSimple, detectThumbSimple]);

  // Simple face detection
  const detectFaceSimple = useCallback((data, width, height) => {
    // Add safety check for dimensions
    if (width <= 0 || height <= 0 || !data || data.length === 0) {
      setIsDetected(false);
      setDetectionScore(0);
      setDebugInfo('Invalid video dimensions or data');
      return;
    }
    
    const centerX = width / 2;
    const centerY = height / 2;
    const ovalRadiusX = width * 0.32;
    const ovalRadiusY = height * 0.42;
    
    let totalPixels = 0;
    let contentPixels = 0;
    let skinPixels = 0;
    let darkPixels = 0;
    let totalBrightness = 0;
    
    // Sample pixels in the oval area (skip pixels for performance)
    for (let y = Math.max(0, Math.floor(centerY - ovalRadiusY)); y < Math.min(height, Math.ceil(centerY + ovalRadiusY)); y += 4) {
      for (let x = Math.max(0, Math.floor(centerX - ovalRadiusX)); x < Math.min(width, Math.ceil(centerX + ovalRadiusX)); x += 4) {
        const normalizedX = (x - centerX) / ovalRadiusX;
        const normalizedY = (y - centerY) / ovalRadiusY;
        
        if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
          const i = (y * width + x) * 4;
          if (i + 3 < data.length) {
            const r = data[i] || 0;
            const g = data[i + 1] || 0;
            const b = data[i + 2] || 0;
            
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;
            totalPixels++;
            
            // Check for content (not too dark, not too bright)
            if (brightness > 20 && brightness < 240) {
              contentPixels++;
            }
            
            // Relaxed skin detection
            if (r > 50 && g > 30 && b > 15 && r >= g && r >= b) {
              skinPixels++;
            }
            
            // Dark areas (hair, eyes, shadows)
            if (brightness < 120) {
              darkPixels++;
            }
          }
        }
      }
    }
    
    if (totalPixels === 0) {
      setIsDetected(false);
      setDetectionScore(0);
      setDebugInfo('No pixels in detection area');
      return;
    }
    
    const avgBrightness = totalBrightness / totalPixels;
    const contentRatio = contentPixels / totalPixels;
    const skinRatio = skinPixels / totalPixels;
    const darkRatio = darkPixels / totalPixels;
    
    // More lenient scoring
    let score = 0;
    
    // Good lighting (35 points)
    if (avgBrightness > 40 && avgBrightness < 190) {
      score += 35;
    } else if (avgBrightness > 20 && avgBrightness < 220) {
      score += 20;
    }
    
    // Content presence (35 points)
    if (contentRatio > 0.6) {
      score += 35;
    } else if (contentRatio > 0.4) {
      score += 20;
    }
    
    // Skin tone (20 points) 
    if (skinRatio > 0.05) {
      score += 20;
    } else if (skinRatio > 0.02) {
      score += 10;
    }
    
    // Contrast from dark areas (10 points)
    if (darkRatio > 0.05 && darkRatio < 0.6) {
      score += 10;
    }
    
    const detected = score >= 30; // Even lower threshold for testing!
    setIsDetected(detected);
    setDetectionScore(Math.min(score, 100));
    
    const debug = `Face: Brightness=${avgBrightness.toFixed(0)} Content=${(contentRatio*100).toFixed(0)}% Skin=${(skinRatio*100).toFixed(0)}% Dark=${(darkRatio*100).toFixed(0)}% Score=${score}`;
    setDebugInfo(debug);
    console.log(`🔍 ${debug} -> Detected: ${detected}`);
  }, [setIsDetected, setDetectionScore, setDebugInfo]);

  // Simple thumb detection  
  const detectThumbSimple = useCallback((data, width, height) => {
    // Add safety check for dimensions
    if (width <= 0 || height <= 0 || !data || data.length === 0) {
      setIsDetected(false);
      setDetectionScore(0);
      setDebugInfo('Invalid video dimensions or data');
      return;
    }
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    let totalPixels = 0;
    let contentPixels = 0;
    let skinPixels = 0;
    let darkPixels = 0;
    let totalBrightness = 0;
    
    // Sample pixels in the circular area (skip pixels for performance)
    for (let y = Math.max(0, Math.floor(centerY - radius)); y < Math.min(height, Math.ceil(centerY + radius)); y += 3) {
      for (let x = Math.max(0, Math.floor(centerX - radius)); x < Math.min(width, Math.ceil(centerX + radius)); x += 3) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (distance < radius) {
          const i = (y * width + x) * 4;
          if (i + 3 < data.length) {
            const r = data[i] || 0;
            const g = data[i + 1] || 0;
            const b = data[i + 2] || 0;
            
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;
            totalPixels++;
            
            // Content check (more lenient)
            if (brightness > 30 && brightness < 220) {
              contentPixels++;
            }
            
            // Relaxed skin detection for thumb
            if (r > 60 && g > 35 && b > 20 && r >= g && r >= b) {
              skinPixels++;
            }
            
            // Thumb ridges (darker areas)
            if (brightness < 140) {
              darkPixels++;
            }
          }
        }
      }
    }
    
    if (totalPixels === 0) {
      setIsDetected(false);
      setDetectionScore(0);
      setDebugInfo('No pixels in detection area');
      return;
    }
    
    const avgBrightness = totalBrightness / totalPixels;
    const contentRatio = contentPixels / totalPixels;
    const skinRatio = skinPixels / totalPixels;
    const darkRatio = darkPixels / totalPixels;
    
    // More lenient scoring 
    let score = 0;
    
    // Good lighting (35 points)
    if (avgBrightness > 60 && avgBrightness < 170) {
      score += 35;
    } else if (avgBrightness > 40 && avgBrightness < 200) {
      score += 20;
    }
    
    // Content presence (35 points)
    if (contentRatio > 0.7) {
      score += 35;
    } else if (contentRatio > 0.5) {
      score += 20;
    }
    
    // Skin tone (20 points)
    if (skinRatio > 0.15) {
      score += 20;
    } else if (skinRatio > 0.08) {
      score += 10;
    }
    
    // Fingerprint ridges (10 points)
    if (darkRatio > 0.15 && darkRatio < 0.7) {
      score += 10;
    }
    
    const detected = score >= 25; // Even lower threshold for testing!
    setIsDetected(detected);
    setDetectionScore(Math.min(score, 100));
    
    const debug = `Thumb: Brightness=${avgBrightness.toFixed(0)} Content=${(contentRatio*100).toFixed(0)}% Skin=${(skinRatio*100).toFixed(0)}% Dark=${(darkRatio*100).toFixed(0)}% Score=${score}`;
    setDebugInfo(debug);
    console.log(`👍 ${debug} -> Detected: ${detected}`);
  }, [setIsDetected, setDetectionScore, setDebugInfo]);

  // Start detection when component mounts
  useEffect(() => {
    console.log(`Starting detection for ${type}`);
    
    const checkVideoReadiness = () => {
      if (
        webcamRef.current?.video &&
        webcamRef.current.video.readyState >= 3 &&
        webcamRef.current.video.videoWidth > 0 &&
        webcamRef.current.video.videoHeight > 0
      ) {
        console.log('Video ready, starting detection');
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        intervalRef.current = setInterval(() => {
          performDetection();
        }, 300); // Check every 300ms for better performance
        return true;
      }
      return false;
    };
    
    // Check immediately, then retry every 500ms until ready
    if (!checkVideoReadiness()) {
      const readyCheckInterval = setInterval(() => {
        if (checkVideoReadiness()) {
          clearInterval(readyCheckInterval);
        }
      }, 500);
      
      // Fallback timeout
      const fallbackTimer = setTimeout(() => {
        clearInterval(readyCheckInterval);
        console.log('Fallback: Starting detection anyway');
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(performDetection, 300);
      }, 5000);
      
      return () => {
        clearInterval(readyCheckInterval);
        clearTimeout(fallbackTimer);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    
    return () => {
      console.log(`Stopping detection for ${type}`);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [type, performDetection]);

  // Capture function
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc && onCapture) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  // Auto capture when detected
  useEffect(() => {
    console.log(`Auto-capture check: isDetected=${isDetected}, score=${detectionScore}`);
    
    if (isDetected && detectionScore > 30) { // Lowered threshold even more
      console.log(`🎯 Auto-capture triggered! Score: ${detectionScore}`);
      const timer = setTimeout(() => {
        console.log('📸 Auto-capturing now...');
        captureImage();
      }, 1000); // Reduced wait time to 1 second
      
      return () => {
        console.log('⏹️ Auto-capture timer cleared');
        clearTimeout(timer);
      };
    } else {
      console.log(`❌ Auto-capture conditions not met: detected=${isDetected}, score=${detectionScore}`);
    }
  }, [isDetected, detectionScore, captureImage]);

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '8px',
            border: `3px solid ${isDetected ? '#4caf50' : '#ff9800'}`,
            boxShadow: isDetected ? '0 0 20px rgba(76, 175, 80, 0.5)' : '0 0 20px rgba(255, 152, 0, 0.3)'
          }}
        />
        
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0
          }}
        />
        
        {/* Detection overlay */}
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
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            style={{ 
              position: 'absolute',
              width: '100%',
              height: '100%'
            }}
          >
            {type === 'face' ? (
              <ellipse
                cx="50"
                cy="50"
                rx="32"
                ry="42"
                fill="none"
                stroke={isDetected ? '#4caf50' : '#ff9800'}
                strokeWidth="3"
                strokeDasharray={isDetected ? "0" : "5,5"}
                style={{
                  filter: isDetected ? 'drop-shadow(0 0 10px rgba(76, 175, 80, 0.8))' : 'none'
                }}
              />
            ) : (
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke={isDetected ? '#4caf50' : '#ff9800'}
                strokeWidth="3"
                strokeDasharray={isDetected ? "0" : "5,5"}
                style={{
                  filter: isDetected ? 'drop-shadow(0 0 10px rgba(76, 175, 80, 0.8))' : 'none'
                }}
              />
            )}
          </svg>
        </Box>

        {/* Enhanced status indicator */}
        <Box sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          right: 8,
          backgroundColor: isDetected ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)',
          borderRadius: 2,
          p: 1,
          textAlign: 'center'
        }}>
          <Typography variant="body2" 
            sx={{ 
              color: 'white',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {isDetected ? 
              `✓ ${type.toUpperCase()} DETECTED (${Math.round(detectionScore)}%) - AUTO-CAPTURE IN 1s` : 
              `Position your ${type} in the ${type === 'face' ? 'oval' : 'circle'} (Score: ${Math.round(detectionScore)}%)`
            }
          </Typography>
        </Box>

        {/* Progress bar for detection score */}
        <Box sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          height: 6,
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <Box sx={{
            width: `${detectionScore}%`,
            height: '100%',
            backgroundColor: isDetected ? '#4caf50' : '#ff9800',
            borderRadius: 3,
            transition: 'width 0.3s ease'
          }} />
        </Box>
      </Box>

      {/* Debug info display */}
      {debugInfo && (
        <Alert severity="info" sx={{ mt: 1, fontSize: '0.75rem', maxWidth: 400 }}>
          {debugInfo}
        </Alert>
      )}

      {/* Control buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={captureImage}
          sx={{
            backgroundColor: isDetected ? '#4caf50' : '#ff9800',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: isDetected ? '#45a049' : '#e68900'
            }
          }}
        >
          {isDetected ? `Capture ${type}` : `Manual Capture`}
        </Button>
        <Button 
          variant="outlined" 
          size="large"
          onClick={onCancel}
          sx={{ px: 3, py: 1.5 }}
        >
          Cancel
        </Button>
      </Box>

      {/* Simple instructions */}
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
        {type === 'face' ? 
          'Center your face in the oval guide' : 
          'Place your thumb completely in the circle'
        }
      </Typography>
    </Box>
  );
}

export default BiometricCapture;

export default BiometricCapture;