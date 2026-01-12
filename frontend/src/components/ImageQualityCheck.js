import React, { useEffect, useState } from 'react';
import { Box, Alert, LinearProgress, Typography, Chip } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';

function ImageQualityCheck({ imageData }) {
  const [quality, setQuality] = useState(null);

  useEffect(() => {
    if (!imageData) return;
    
    const checkQuality = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;
        
        // Calculate brightness
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          totalBrightness += brightness;
        }
        const avgBrightness = totalBrightness / (data.length / 4);
        
        // Calculate sharpness (edge detection approximation)
        let sharpness = 0;
        for (let i = 0; i < data.length - 4; i += 4) {
          const diff = Math.abs(data[i] - data[i + 4]);
          sharpness += diff;
        }
        const avgSharpness = sharpness / (data.length / 4);
        
        // Determine quality
        let score = 0;
        let issues = [];
        
        // Brightness check (ideal: 80-180)
        if (avgBrightness < 50) {
          issues.push('Too dark - improve lighting');
        } else if (avgBrightness > 200) {
          issues.push('Too bright - reduce lighting');
        } else if (avgBrightness >= 80 && avgBrightness <= 180) {
          score += 40;
        } else {
          score += 20;
        }
        
        // Sharpness check
        if (avgSharpness < 5) {
          issues.push('Blurry - hold steady');
        } else if (avgSharpness >= 15) {
          score += 40;
        } else {
          score += 20;
        }
        
        // Resolution check
        const totalPixels = img.width * img.height;
        if (totalPixels < 50000) {
          issues.push('Low resolution - move closer');
        } else if (totalPixels >= 100000) {
          score += 20;
        } else {
          score += 10;
        }
        
        setQuality({
          score,
          brightness: avgBrightness,
          sharpness: avgSharpness,
          resolution: totalPixels,
          issues,
          level: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'
        });
      };
      img.src = imageData;
    };
    
    checkQuality();
  }, [imageData]);

  if (!quality) return null;

  const getColor = () => {
    switch (quality.level) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const getIcon = () => {
    switch (quality.level) {
      case 'excellent':
      case 'good':
        return <CheckCircle />;
      case 'fair':
        return <Warning />;
      case 'poor':
        return <Error />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          Image Quality:
        </Typography>
        <Chip 
          icon={getIcon()}
          label={quality.level.toUpperCase()}
          color={getColor()}
          size="small"
        />
        <Typography variant="body2" color="text.secondary">
          ({quality.score}%)
        </Typography>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={quality.score} 
        color={getColor()}
        sx={{ height: 8, borderRadius: 1, mb: 1 }}
      />
      
      {quality.issues.length > 0 && (
        <Alert severity={quality.level === 'poor' ? 'error' : 'warning'} sx={{ mt: 1, borderRadius: 2 }}>
          <Typography variant="caption" component="div">
            <strong>Tips to improve:</strong>
            {quality.issues.map((issue, idx) => (
              <div key={idx}>• {issue}</div>
            ))}
          </Typography>
        </Alert>
      )}
      
      {quality.level === 'excellent' && (
        <Alert severity="success" sx={{ mt: 1, borderRadius: 2 }}>
          <Typography variant="caption">
            ✓ Excellent quality! This will improve verification accuracy.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

export default ImageQualityCheck;
