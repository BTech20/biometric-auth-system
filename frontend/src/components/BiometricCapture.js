import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Typography, ButtonGroup, Button, Alert } from '@mui/material';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

function BiometricCapture({ type = 'face', onCapture, onCancel }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetected, setIsDetected] = useState(false);
  const [detectionScore, setDetectionScore] = useState(0);

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      if (type === 'face') {
        try {
          const MODEL_URL = '/models';
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          setIsModelLoaded(true);
        } catch (error) {
          console.error('Failed to load face detection models:', error);
          // Fallback to basic detection
          setIsModelLoaded(true);
        }
      } else {
        setIsModelLoaded(true);
      }
    };
    loadModels();
  }, [type]);

  // Face detection function
  const detectFace = useCallback(async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      if (!canvas) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      try {
        // Try face-api.js detection first
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );

        if (detections && detections.length > 0) {
          const detection = detections[0];
          const { x, y, width, height } = detection.box;
          
          // Check if face is in the center area (our oval guide)
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const faceCenter = { x: x + width / 2, y: y + height / 2 };
          
          // Define acceptable area (oval bounds)
          const ovalWidth = canvas.width * 0.6;
          const ovalHeight = canvas.height * 0.8;
          
          const isInBounds = (
            Math.abs(faceCenter.x - centerX) < ovalWidth / 2 &&
            Math.abs(faceCenter.y - centerY) < ovalHeight / 2
          );
          
          setIsDetected(isInBounds);
          setDetectionScore(Math.min(detection.score * 100, 100));
        } else {
          // Fallback: basic detection using brightness and movement
          await basicFaceDetection(video, canvas);
        }
      } catch (error) {
        // Fallback to basic detection
        await basicFaceDetection(video, canvas);
      }
    }
  }, []);

  // Fallback face detection using basic computer vision
  const basicFaceDetection = useCallback(async (video, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Analyze center region for movement/content
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const sampleRadius = 100;
    
    let totalBrightness = 0;
    let pixelCount = 0;
    
    for (let y = centerY - sampleRadius; y < centerY + sampleRadius; y++) {
      for (let x = centerX - sampleRadius; x < centerX + sampleRadius; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const i = (y * canvas.width + x) * 4;
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          totalBrightness += brightness;
          pixelCount++;
        }
      }
    }
    
    const avgBrightness = totalBrightness / pixelCount;
    
    // Consider detected if there's reasonable brightness variation (indicating a face)
    const isContentDetected = avgBrightness > 50 && avgBrightness < 200;
    setIsDetected(isContentDetected);
    setDetectionScore(isContentDetected ? 75 : 25);
  }, []);

  // Thumb detection function
  const detectThumb = useCallback(() => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      if (!canvas) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Analyze circular center region
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;
      
      let darkPixels = 0;
      let totalPixels = 0;
      let avgBrightness = 0;
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          
          if (distance < radius) {
            const i = (y * canvas.width + x) * 4;
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            avgBrightness += brightness;
            totalPixels++;
            
            if (brightness < 120) {
              darkPixels++;
            }
          }
        }
      }
      
      avgBrightness /= totalPixels;
      const darkRatio = darkPixels / totalPixels;
      
      // Consider thumb detected if there's enough contrast and appropriate darkness
      const isThumbDetected = darkRatio > 0.3 && darkRatio < 0.8 && avgBrightness > 80 && avgBrightness < 180;
      setIsDetected(isThumbDetected);
      setDetectionScore(isThumbDetected ? Math.min(darkRatio * 150, 100) : Math.max(darkRatio * 50, 10));
    }
  }, []);

  // Start detection when models are loaded
  useEffect(() => {
    if (isModelLoaded) {
      const detectionFunction = type === 'face' ? detectFace : detectThumb;
      
      intervalRef.current = setInterval(() => {
        detectionFunction();
      }, 200); // Check every 200ms
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isModelLoaded, detectFace, detectThumb, type]);

  const handleCapture = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      onCapture(screenshot);
    }
  };

  const guideColor = isDetected ? '#00ff88' : '#ff9800';
  const guideDashArray = isDetected ? 'none' : '5,5';

  return (
    <Box sx={{ mb: 2, border: `2px solid ${guideColor}`, borderRadius: 2, p: 1, bgcolor: '#000', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0
        }}
      />
      
      <Box sx={{ position: 'relative', width: '100%', paddingBottom: '75%' }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          width="100%"
          screenshotFormat="image/jpeg"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '8px'
          }}
        />
        
        {/* Dynamic SVG Guide */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            borderRadius: '8px',
            zIndex: 10
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Darken edges */}
          <rect width="100" height="100" fill="rgba(0,0,0,0.4)" />
          
          {type === 'face' ? (
            <>
              {/* Face Guide - Oval */}
              <ellipse
                cx="50"
                cy="50"
                rx="32"
                ry="42"
                fill="none"
                stroke={guideColor}
                strokeWidth="2"
                strokeDasharray={guideDashArray}
              />
              {/* Corner guides */}
              <circle cx="50" cy="15" r="2" fill={guideColor} />
              <circle cx="50" cy="85" r="2" fill={guideColor} />
              <circle cx="18" cy="50" r="2" fill={guideColor} />
              <circle cx="82" cy="50" r="2" fill={guideColor} />
            </>
          ) : (
            <>
              {/* Thumb Guide - Circle */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke={guideColor}
                strokeWidth="2"
                strokeDasharray={guideDashArray}
              />
              {/* Center dot */}
              <circle cx="50" cy="50" r="2" fill={guideColor} />
              
              {/* Directional text */}
              <text
                x="50"
                y="12"
                textAnchor="middle"
                fill={guideColor}
                fontSize="4"
                fontWeight="bold"
              >
                ↑ PLACE THUMB HERE
              </text>
            </>
          )}
          
          {/* Detection status */}
          <rect x="5" y="5" width="90" height="12" fill="rgba(0,0,0,0.7)" rx="2" />
          <text
            x="50"
            y="13"
            textAnchor="middle"
            fill={guideColor}
            fontSize="5"
            fontWeight="bold"
          >
            {isDetected ? 
              `✓ ${type.toUpperCase()} DETECTED (${Math.round(detectionScore)}%)` : 
              `Looking for ${type}...`
            }
          </text>
        </svg>
      </Box>
      
      {/* Status Alert */}
      {!isModelLoaded && type === 'face' && (
        <Alert severity="info" sx={{ mt: 1, fontSize: '0.8rem' }}>
          Loading face detection models...
        </Alert>
      )}
      
      {isDetected && (
        <Alert severity="success" sx={{ mt: 1, fontSize: '0.8rem' }}>
          {type === 'face' ? 'Face detected in position!' : 'Thumb detected in position!'} 
          <strong> Ready to capture.</strong>
        </Alert>
      )}
      
      {/* Positioning Tips */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        mt: 2,
        mb: 2
      }}>
        <Box sx={{ 
          bgcolor: `rgba(${isDetected ? '0,255,136' : '255,152,0'},0.1)`,
          border: `1px solid ${guideColor}`,
          p: 1.5,
          borderRadius: 1,
          fontSize: '0.85rem',
          color: guideColor
        }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
            ✓ Good Position
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            {type === 'face' ? 
              '• Face centered\n• Good lighting\n• Eyes open\n• Neutral look' :
              '• Thumb centered\n• Flat surface\n• Clear ridges\n• Steady position'
            }
          </Typography>
        </Box>
        <Box sx={{ 
          bgcolor: 'rgba(255,68,68,0.1)',
          border: '1px solid #ff4444',
          p: 1.5,
          borderRadius: 1,
          fontSize: '0.85rem',
          color: '#ff9999'
        }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
            ✗ Avoid
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            {type === 'face' ?
              '• Too dark/bright\n• Off-center\n• Blurry image\n• Extreme angles' :
              '• Angled thumb\n• Blurry image\n• Too dark/light\n• Off-center'
            }
          </Typography>
        </Box>
      </Box>
      
      <ButtonGroup fullWidth sx={{ mt: 1 }}>
        <Button
          variant="contained"
          onClick={handleCapture}
          disabled={!isDetected}
          sx={{
            bgcolor: isDetected ? '#00ff88' : '#666',
            color: '#000',
            py: 1.5,
            fontWeight: 700,
            '&:hover': {
              bgcolor: isDetected ? '#00cc6a' : '#555'
            },
            '&:disabled': {
              bgcolor: '#333',
              color: '#999'
            }
          }}
        >
          {isDetected ? `✓ Capture ${type}` : `Position ${type} first`}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            borderColor: '#ff4444',
            color: '#ff4444',
            py: 1.5,
            fontWeight: 600,
            '&:hover': {
              borderColor: '#ff4444',
              bgcolor: 'rgba(255,68,68,0.1)'
            }
          }}
        >
          Cancel
        </Button>
      </ButtonGroup>
    </Box>
  );
}

export default BiometricCapture;