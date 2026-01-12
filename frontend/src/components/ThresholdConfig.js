import React, { useState } from 'react';
import { Box, Typography, Slider, Paper, Alert, Chip } from '@mui/material';
import { Security, Speed, BalanceOutlined } from '@mui/icons-material';

function ThresholdConfig({ onThresholdChange, currentThreshold = 15 }) {
  const [threshold, setThreshold] = useState(currentThreshold);

  const handleChange = (event, newValue) => {
    setThreshold(newValue);
    if (onThresholdChange) {
      onThresholdChange(newValue);
    }
  };

  const getRecommendation = () => {
    if (threshold <= 10) {
      return {
        level: 'Maximum Security',
        desc: 'Very strict - may reject genuine users',
        icon: <Security />,
        color: 'error'
      };
    } else if (threshold <= 15) {
      return {
        level: 'High Security',
        desc: 'Recommended for identity cards',
        icon: <Security />,
        color: 'success'
      };
    } else if (threshold <= 25) {
      return {
        level: 'Balanced',
        desc: 'Good balance of security and usability',
        icon: <BalanceOutlined />,
        color: 'info'
      };
    } else {
      return {
        level: 'User Friendly',
        desc: 'More lenient - may accept impostors',
        icon: <Speed />,
        color: 'warning'
      };
    }
  };

  const rec = getRecommendation();

  const marks = [
    { value: 5, label: '5' },
    { value: 15, label: '15' },
    { value: 25, label: '25' },
    { value: 35, label: '35' },
    { value: 50, label: '50' }
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3,
        border: '2px solid #333',
        borderRadius: 3,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
          Verification Threshold
        </Typography>
        <Chip 
          icon={rec.icon}
          label={rec.level}
          color={rec.color}
          size="medium"
          sx={{
            fontWeight: 600,
            fontSize: '0.9rem',
            bgcolor: rec.color === 'error' ? '#ff4444' : 
                     rec.color === 'warning' ? '#ff9800' :
                     rec.color === 'info' ? '#2196f3' : '#00ff88',
            color: '#000',
            '& .MuiChip-icon': { color: '#000' }
          }}
        />
      </Box>

      <Typography variant="body2" sx={{ color: '#aaa', mb: 3, fontSize: '1rem' }}>
        Adjust the matching threshold. Lower = more secure but stricter. Higher = more lenient but less secure.
      </Typography>

      <Box sx={{ px: 1, mb: 3 }}>
        <Slider
          value={threshold}
          onChange={handleChange}
          min={5}
          max={50}
          marks={marks}
          valueLabelDisplay="on"
          sx={{
            '& .MuiSlider-thumb': {
              width: 28,
              height: 28,
              bgcolor: '#00ff88',
              border: '3px solid #000',
              '&:hover': {
                boxShadow: '0 0 20px rgba(0,255,136,0.6)'
              }
            },
            '& .MuiSlider-valueLabel': {
              fontSize: '1rem',
              fontWeight: 700,
              background: '#00ff88',
              color: '#000'
            },
            '& .MuiSlider-track': {
              background: threshold <= 15 ? '#ff4444' : 
                         threshold <= 25 ? '#ff9800' : '#00ff88',
              height: 6,
              border: 'none'
            },
            '& .MuiSlider-rail': {
              bgcolor: '#333',
              height: 6
            },
            '& .MuiSlider-mark': {
              bgcolor: '#666',
              width: 3,
              height: 12
            },
            '& .MuiSlider-markLabel': {
              color: '#999',
              fontWeight: 600
            }
          }}
        />
      </Box>

      <Alert 
        severity={rec.color} 
        icon={rec.icon}
        sx={{ 
          borderRadius: 2,
          bgcolor: rec.color === 'error' ? 'rgba(255,68,68,0.1)' : 
                   rec.color === 'warning' ? 'rgba(255,152,0,0.1)' :
                   rec.color === 'info' ? 'rgba(33,150,243,0.1)' : 'rgba(0,255,136,0.1)',
          border: `2px solid ${rec.color === 'error' ? '#ff4444' : 
                                rec.color === 'warning' ? '#ff9800' :
                                rec.color === 'info' ? '#2196f3' : '#00ff88'}`,
          '& .MuiAlert-icon': {
            color: rec.color === 'error' ? '#ff4444' : 
                   rec.color === 'warning' ? '#ff9800' :
                   rec.color === 'info' ? '#2196f3' : '#00ff88'
          }
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5, color: '#fff' }}>
          Current Setting: {threshold}
        </Typography>
        <Typography variant="body2" sx={{ color: '#ccc' }}>
          {rec.desc}
        </Typography>
      </Alert>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#1a1a1a', borderRadius: 2, border: '1px solid #333' }}>
        <Typography variant="body2" sx={{ color: '#aaa', lineHeight: 1.7 }}>
          <strong style={{ color: '#00ff88' }}>Understanding Thresholds:</strong>
          <br />• Hamming Distance measures how different two biometric hash codes are
          <br />• Lower threshold = stricter matching (fewer false acceptances)
          <br />• Higher threshold = lenient matching (fewer false rejections)
          <br />• Default 15 ≈ 12% difference allowed (recommended for high security)
        </Typography>
      </Box>
    </Paper>
  );
}

export default ThresholdConfig;
