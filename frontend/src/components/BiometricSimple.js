import React, { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Webcam from 'react-webcam';

function BiometricSimple({ type = 'face', onCapture, onCancel }) {
  
  useEffect(() => {
    console.log('🚀 BiometricSimple LOADED!');
    alert(`BiometricSimple loaded for ${type}!`);
  }, [type]);

  const handleCapture = () => {
    console.log('📸 Manual capture clicked');
    alert('Manual capture clicked!');
    if (onCapture) {
      onCapture('data:image/jpeg;base64,test-image-data');
    }
  };

  return (
    <Box sx={{ 
      border: '5px solid red',
      borderRadius: 2,
      p: 3,
      bgcolor: 'yellow',
      color: 'black'
    }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        🧪 DIAGNOSTIC MODE - {type.toUpperCase()}
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        This is BiometricSimple component running!
      </Typography>
      
      <Webcam
        audio={false}
        screenshotFormat="image/jpeg"
        style={{
          width: '100%',
          maxWidth: 300,
          height: 200,
          border: '3px solid blue'
        }}
      />
      
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleCapture}
          sx={{
            backgroundColor: 'red',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}
        >
          🔴 TEST CAPTURE
        </Button>
        <Button 
          variant="outlined"
          size="large"
          onClick={onCancel}
          sx={{
            borderColor: 'black',
            color: 'black',
            fontWeight: 'bold'
          }}
        >
          ❌ CANCEL
        </Button>
      </Box>
    </Box>
  );
}

export default BiometricSimple;