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
          // Try loading models from CDN first, then fallback to local
          const MODEL_URL = process.env.NODE_ENV === 'production' 
            ? 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'
            : '/models';
          
          console.log('Loading face detection models from:', MODEL_URL);
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
          ]);
          console.log('Face detection models loaded successfully');
          setIsModelLoaded(true);
        } catch (error) {
          console.warn('Failed to load face-api.js models, using fallback detection:', error);
          // Always set model loaded to true to use fallback detection
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
        // Try face-api.js detection first if available
        if (typeof faceapi !== 'undefined' && faceapi.nets && faceapi.nets.tinyFaceDetector) {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
          );

          if (detections && detections.length > 0) {
            const detection = detections[0];
            const { x, y, width, height } = detection.box;
            
            // Check if face is in the center area (our oval guide)
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const faceCenter = { x: x + width / 2, y: y + height / 2 };
            
            // Define acceptable area (oval bounds)
            const ovalWidth = canvas.width * 0.64; // 32*2 from SVG
            const ovalHeight = canvas.height * 0.84; // 42*2 from SVG
            
            const isInBounds = (
              Math.abs(faceCenter.x - centerX) < ovalWidth / 2 &&
              Math.abs(faceCenter.y - centerY) < ovalHeight / 2 &&
              width > canvas.width * 0.15 && // Minimum face size
              height > canvas.height * 0.15
            );
            
            setIsDetected(isInBounds);
            setDetectionScore(Math.min(detection.score * 100, 100));
            console.log('Face-api detection:', isInBounds, detection.score);
            return;
          }
        }
      } catch (error) {
        console.warn('Face-api.js detection failed, using fallback:', error);
      }
      
      // Enhanced fallback detection
      await enhancedFaceDetection(video, canvas);
    }
  }, []);

  // Enhanced fallback face detection using better computer vision
  const enhancedFaceDetection = useCallback(async (video, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Define the oval detection area matching our SVG guide
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const ovalRadiusX = canvas.width * 0.32; // 32% from SVG
    const ovalRadiusY = canvas.height * 0.42; // 42% from SVG
    
    let totalBrightness = 0;
    let darkPixels = 0;
    let edgePixels = 0;
    let skinTonePixels = 0;
    let totalPixelsInOval = 0;
    
    // Analyze pixels within the oval area
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        // Check if pixel is within oval bounds
        const normalizedX = (x - centerX) / ovalRadiusX;
        const normalizedY = (y - centerY) / ovalRadiusY;
        
        if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const brightness = (r + g + b) / 3;
          totalBrightness += brightness;
          totalPixelsInOval++;
          
          // Detect skin tone (simplified heuristic)
          if (r > 95 && g > 40 && b > 20 && r > g && r > b && 
              Math.abs(r - g) > 15 && r - b > 15) {
            skinTonePixels++;
          }
          
          // Detect dark regions (eyes, hair, shadows)
          if (brightness < 80) {
            darkPixels++;
          }
          
          // Edge detection (simple gradient)
          if (x > 0 && y > 0) {
            const prevI = ((y-1) * canvas.width + (x-1)) * 4;
            const prevBrightness = (data[prevI] + data[prevI + 1] + data[prevI + 2]) / 3;
            if (Math.abs(brightness - prevBrightness) > 30) {
              edgePixels++;
            }
          }
        }
      }
    }
    
    if (totalPixelsInOval === 0) {
      setIsDetected(false);
      setDetectionScore(0);
      return;
    }
    
    const avgBrightness = totalBrightness / totalPixelsInOval;
    const skinToneRatio = skinTonePixels / totalPixelsInOval;
    const darkRatio = darkPixels / totalPixelsInOval;
    const edgeRatio = edgePixels / totalPixelsInOval;
    
    // Scoring algorithm for face detection
    let score = 0;
    
    // Good lighting conditions (30 points)
    if (avgBrightness > 60 && avgBrightness < 200) {
      score += 30;
    } else if (avgBrightness > 40 && avgBrightness < 220) {
      score += 15;
    }
    
    // Skin tone presence (25 points)
    if (skinToneRatio > 0.15) {
      score += 25;
    } else if (skinToneRatio > 0.08) {
      score += 12;
    }
    
    // Good contrast from dark areas like eyes/hair (25 points)
    if (darkRatio > 0.1 && darkRatio < 0.4) {
      score += 25;
    } else if (darkRatio > 0.05 && darkRatio < 0.5) {
      score += 12;
    }
    
    // Edge content indicating facial features (20 points)
    if (edgeRatio > 0.08) {
      score += 20;
    } else if (edgeRatio > 0.04) {
      score += 10;
    }
    
    const isDetected = score >= 70; // Threshold for face detection
    setIsDetected(isDetected);
    setDetectionScore(Math.min(score, 100));
    
    console.log('Enhanced fallback detection:', {
      score,
      isDetected,
      avgBrightness: avgBrightness.toFixed(1),
      skinToneRatio: (skinToneRatio * 100).toFixed(1) + '%',
      darkRatio: (darkRatio * 100).toFixed(1) + '%',
      edgeRatio: (edgeRatio * 100).toFixed(1) + '%'
    });
  }, []);

  // Enhanced thumb detection function
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
      
      // Analyze circular center region matching SVG guide
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35; // 35% radius from SVG
      
      let darkPixels = 0;
      let mediumPixels = 0;
      let totalPixels = 0;
      let avgBrightness = 0;
      let ridgePatterns = 0;
      let skinTonePixels = 0;
      
      // Analyze pixels within the circular area
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          
          if (distance < radius) {
            const i = (y * canvas.width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            
            avgBrightness += brightness;
            totalPixels++;
            
            // Categorize pixels by brightness
            if (brightness < 80) {
              darkPixels++;
            } else if (brightness < 160) {
              mediumPixels++;
            }
            
            // Detect skin tone for thumb
            if (r > 95 && g > 40 && b > 20 && r > g && 
                Math.abs(r - g) > 10 && r - b > 5) {
              skinTonePixels++;
            }
            
            // Simple ridge pattern detection (local contrast)
            if (x > 2 && x < canvas.width - 2 && y > 2 && y < canvas.height - 2) {
              let localContrast = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const ni = ((y + dy) * canvas.width + (x + dx)) * 4;
                  const nBrightness = (data[ni] + data[ni + 1] + data[ni + 2]) / 3;
                  localContrast += Math.abs(brightness - nBrightness);
                }
              }
              if (localContrast > 200) {
                ridgePatterns++;
              }
            }
          }
        }
      }
      
      if (totalPixels === 0) {
        setIsDetected(false);
        setDetectionScore(0);
        return;
      }
      
      avgBrightness /= totalPixels;
      const darkRatio = darkPixels / totalPixels;
      const mediumRatio = mediumPixels / totalPixels;
      const skinRatio = skinTonePixels / totalPixels;
      const ridgeRatio = ridgePatterns / totalPixels;
      
      // Scoring algorithm for thumb detection
      let score = 0;
      
      // Good lighting (25 points)
      if (avgBrightness > 90 && avgBrightness < 180) {
        score += 25;
      } else if (avgBrightness > 70 && avgBrightness < 200) {
        score += 15;
      }
      
      // Appropriate contrast for fingerprint ridges (30 points)
      if (darkRatio > 0.2 && darkRatio < 0.6) {
        score += 30;
      } else if (darkRatio > 0.15 && darkRatio < 0.7) {
        score += 15;
      }
      
      // Skin tone presence (25 points)
      if (skinRatio > 0.3) {
        score += 25;
      } else if (skinRatio > 0.2) {
        score += 15;
      }
      
      // Ridge patterns indicating fingerprint (20 points)
      if (ridgeRatio > 0.05) {
        score += 20;
      } else if (ridgeRatio > 0.02) {
        score += 10;
      }
      
      const isThumbDetected = score >= 70; // Threshold for thumb detection
      setIsDetected(isThumbDetected);
      setDetectionScore(Math.min(score, 100));
      
      console.log('Enhanced thumb detection:', {
        score,
        isDetected: isThumbDetected,
        avgBrightness: avgBrightness.toFixed(1),
        darkRatio: (darkRatio * 100).toFixed(1) + '%',
        skinRatio: (skinRatio * 100).toFixed(1) + '%',
        ridgeRatio: (ridgeRatio * 100).toFixed(1) + '%'
      });
    }
  }, []);

  // Start detection when models are loaded
  useEffect(() => {
    if (isModelLoaded) {
      const detectionFunction = type === 'face' ? detectFace : detectThumb;
      
      intervalRef.current = setInterval(() => {
        detectionFunction();
      }, 100); // Check every 100ms for more responsive detection
      
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
          <rect x="5" y="5" width="90" height="12" fill="rgba(0,0,0,0.8)" rx="2" />
          <text
            x="50"
            y="13"
            textAnchor="middle"
            fill={guideColor}
            fontSize="4.5"
            fontWeight="bold"
          >
            {isDetected ? 
              `✓ ${type.toUpperCase()} DETECTED (${Math.round(detectionScore)}%)` : 
              `Position ${type} in the guide...`
            }
          </text>
          
          {/* Bottom instruction */}
          <rect x="5" y="88" width="90" height="10" fill="rgba(0,0,0,0.8)" rx="1" />
          <text 
            x="50" 
            y="95" 
            textAnchor="middle" 
            fill={guideColor} 
            fontSize="4"
            fontWeight="bold"
          >
            {type === 'face' ? 
              (isDetected ? 'Perfect! Ready to capture' : 'Center your face in the oval') :
              (isDetected ? 'Great! Thumb positioned correctly' : 'Place thumb in the circle')
            }
          </text>
        </svg>
      </Box>
      
      {/* Status Alert */}
      {!isModelLoaded && type === 'face' && (
        <Alert severity="info" sx={{ mt: 1, fontSize: '0.8rem' }}>
          Loading detection models... This may take a moment.
        </Alert>
      )}
      
      {isDetected ? (
        <Alert severity="success" sx={{ mt: 1, fontSize: '0.85rem', fontWeight: 600 }}>
          🎯 {type === 'face' ? 'Face' : 'Thumbprint'} detected in perfect position! 
          <strong> Quality: {Math.round(detectionScore)}% - Ready to capture!</strong>
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mt: 1, fontSize: '0.8rem' }}>
          📍 Position your {type} within the {type === 'face' ? 'oval' : 'circular'} guides above. 
          {detectionScore > 30 && ` Almost there... (${Math.round(detectionScore)}%)`}
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
            bgcolor: isDetected ? '#00ff88' : '#444',
            color: isDetected ? '#000' : '#999',
            py: 1.5,
            fontWeight: 700,
            borderRadius: 2,
            boxShadow: isDetected ? '0 4px 15px rgba(0,255,136,0.4)' : 'none',
            '&:hover': {
              bgcolor: isDetected ? '#00cc6a' : '#555',
              transform: isDetected ? 'translateY(-2px)' : 'none',
              boxShadow: isDetected ? '0 6px 20px rgba(0,255,136,0.6)' : 'none'
            },
            '&:disabled': {
              bgcolor: '#333',
              color: '#666',
              cursor: 'not-allowed'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {isDetected ? 
            `✓ Capture ${type === 'face' ? 'Face' : 'Thumbprint'} (${Math.round(detectionScore)}%)` : 
            `Position ${type === 'face' ? 'face' : 'thumb'} to enable capture`
          }
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