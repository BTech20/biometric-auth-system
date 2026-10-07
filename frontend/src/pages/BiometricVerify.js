import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, Alert, CircularProgress, LinearProgress, ButtonGroup, Fade, Slide, Chip, Divider } from '@mui/material';
import { ArrowBack, Fingerprint, CheckCircle, Cancel, CameraAlt, Upload, FaceRetouchingNatural, FingerprintOutlined, Face } from '@mui/icons-material';
import { authService } from '../services/api';
import HardwareFingerprintScanner from '../components/HardwareFingerprintScanner';
import ThresholdConfig from '../components/ThresholdConfig';
import ImageQualityCheck from '../components/ImageQualityCheck';
import WorkingBiometricCapture from '../components/WorkingBiometricCapture';

function BiometricVerify() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [showFpWebcam, setShowFpWebcam] = useState(false);
  const [useHardwareScanner, setUseHardwareScanner] = useState(false);
  const [customThreshold, setCustomThreshold] = useState(20);
  const webcamRef = useRef(null);
  const fpWebcamRef = useRef(null);
  const faceUploadRef = useRef(null);
  const fpUploadRef = useRef(null);

  const handleVerify = async () => {
    if (!faceImage || !fingerprintImage) {
      setError('Provide both biometrics');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authService.verifyBiometrics(
        { face_image: faceImage, fingerprint_image: fingerprintImage },
        customThreshold
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#0a0a0a',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Fade in timeout={600}>
          <Box>
            <Button 
              startIcon={<ArrowBack sx={{ fontSize: 24 }} />} 
              onClick={() => navigate('/dashboard')}
              variant="contained"
              size="large"
              sx={{ 
                mb: 3,
                bgcolor: '#00ff88',
                color: '#000',
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                border: '2px solid #00ff88',
                boxShadow: '0 4px 15px rgba(0,255,136,0.3)',
                '&:hover': {
                  bgcolor: '#00cc6a',
                  transform: 'translateX(-4px)',
                  boxShadow: '0 6px 20px rgba(0,255,136,0.5)'
                },
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              Back to Dashboard
            </Button>
            
            <Paper sx={{ 
              p: 4, 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,255,136,0.2)',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              border: '1px solid #333'
            }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 3,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                  mb: 2,
                  boxShadow: '0 4px 20px rgba(0,255,136,0.4)'
                }}>
                  <Fingerprint sx={{ fontSize: 50, color: '#000' }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', mb: 1, letterSpacing: '-0.5px' }}>
                  Biometric Verification
                </Typography>
                <Typography variant="body1" sx={{ color: '#999', fontSize: '1.1rem' }}>
                  Secure identity verification with advanced biometrics
                </Typography>
              </Box>
              
              <ThresholdConfig 
                currentThreshold={customThreshold}
                onThresholdChange={(newThreshold) => setCustomThreshold(newThreshold)}
              />
              
              {error && (
                <Slide direction="down" in>
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                </Slide>
              )}
              
              {result && (
                <Slide direction="down" in>
                  <Box sx={{ 
                    mb: 4,
                    p: 4,
                    borderRadius: 3,
                    background: result.verified 
                      ? 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' 
                      : 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                    color: '#000',
                    border: `3px solid ${result.verified ? '#00ff88' : '#ff4444'}`,
                    boxShadow: result.verified 
                      ? '0 8px 32px rgba(0,255,136,0.4)' 
                      : '0 8px 32px rgba(255,68,68,0.4)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                      {result.verified ? (
                        <CheckCircle sx={{ fontSize: 70, mr: 2, color: '#000' }} />
                      ) : (
                        <Cancel sx={{ fontSize: 70, mr: 2, color: '#000' }} />
                      )}
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#000' }}>
                        {result.verified ? '✓ Verified!' : '✗ Verification Failed'}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      bgcolor: 'rgba(0,0,0,0.15)', 
                      p: 3, 
                      borderRadius: 2, 
                      mb: 3,
                      border: '2px solid rgba(0,0,0,0.2)'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#000' }}>
                          Hamming Distance:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#000' }}>
                          {result.hamming_distance?.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#000' }}>
                          Threshold:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#000' }}>
                          {result.threshold}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.max(0, Math.min(100, ((result.threshold - result.hamming_distance) / result.threshold) * 100))} 
                        sx={{ 
                          height: 16,
                          borderRadius: 2,
                          bgcolor: 'rgba(0,0,0,0.3)',
                          border: '2px solid rgba(0,0,0,0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#000',
                            borderRadius: 2
                          }
                        }} 
                      />
                    </Box>
                    {result.username && (
                      <Chip 
                        label={`Verified as: ${result.username}`}
                        sx={{ 
                          bgcolor: '#000',
                          color: result.verified ? '#00ff88' : '#ff4444',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          height: 50,
                          px: 2,
                          border: `2px solid ${result.verified ? '#00ff88' : '#ff4444'}`,
                          '& .MuiChip-label': {
                            px: 2
                          }
                        }}
                      />
                    )}
                    
                    {!result.verified && (
                      <Box sx={{ 
                        mt: 3, 
                        bgcolor: 'rgba(0,0,0,0.25)', 
                        p: 3, 
                        borderRadius: 2,
                        border: '2px solid rgba(0,0,0,0.3)'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#000' }}>
                          ⚠️ Why did this fail?
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#000', lineHeight: 1.8, fontWeight: 500 }}>
                          {result.hamming_distance > 45 ? (
                            <>
                              • <strong>Very High Distance ({result.hamming_distance})</strong> - This suggests you're verifying a different person than {result.username || 'the enrolled user'}
                              <br />• Or the image quality is extremely poor (blurry, dark, wrong angle)
                              <br />• <strong>Action:</strong> Make sure you're using the same person's biometrics from registration, or register a new account
                            </>
                          ) : result.hamming_distance > result.threshold + 5 ? (
                            <>
                              • <strong>Distance {result.hamming_distance} exceeds threshold {result.threshold}</strong> by {(result.hamming_distance - result.threshold).toFixed(1)}
                              <br />• Likely due to poor image quality or different capture angle
                              <br />• <strong>Action:</strong> Recapture with better lighting, hold steady, same position as enrollment
                            </>
                          ) : (
                            <>
                              • <strong>Close match!</strong> Distance {result.hamming_distance} is just slightly over threshold {result.threshold}
                              <br />• This might be the genuine user with minor capture differences
                              <br />• <strong>Action:</strong> Try increasing threshold to {Math.ceil(result.hamming_distance + 2)}, or recapture images
                            </>
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Slide>
              )}
          {!result && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ 
                bgcolor: '#1a1a1a', 
                p: 4, 
                borderRadius: 3, 
                mb: 3,
                border: '2px solid #00ff88',
                boxShadow: '0 4px 20px rgba(0,255,136,0.2)'
              }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#00ff88', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Face sx={{ fontSize: 40 }} />
                  Step 1: Face Verification
                </Typography>
                <Typography variant="body1" sx={{ color: '#ccc', mb: 3, fontSize: '1.1rem' }}>
                  Capture or upload a clear photo of your face
                </Typography>
                {!showWebcam && !faceImage && (
                  <ButtonGroup fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <Button 
                      startIcon={<CameraAlt />} 
                      onClick={() => setShowWebcam(true)}
                      sx={{
                        borderColor: '#00ff88',
                        color: '#00ff88',
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#00ff88',
                          bgcolor: 'rgba(0,255,136,0.1)'
                        }
                      }}
                    >
                      Capture Face
                    </Button>
                    <Button 
                      startIcon={<Upload />} 
                      onClick={() => faceUploadRef.current.click()}
                      sx={{
                        borderColor: '#ff9800',
                        color: '#ff9800',
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#ff9800',
                          bgcolor: 'rgba(255,152,0,0.1)'
                        }
                      }}
                    >
                      Upload Image
                    </Button>
                  </ButtonGroup>
                )}
              <input type="file" hidden ref={faceUploadRef} accept="image/*" capture="user" onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  const r = new FileReader();
                  r.onload = () => setFaceImage(r.result);
                  r.readAsDataURL(f);
                }
              }} />
              {showWebcam && (
                <WorkingBiometricCapture 
                  type="face"
                  onCapture={(imageData) => {
                    setFaceImage(imageData);
                    setShowWebcam(false);
                  }}
                  onCancel={() => setShowWebcam(false)}
                />
              )}
              {faceImage && !showWebcam && (
                <Box sx={{ mb: 3, p: 2, bgcolor: '#000', borderRadius: 2, border: '2px solid #00ff88' }}>
                  <Typography variant="body1" sx={{ color: '#00ff88', mb: 2, fontWeight: 600 }}>
                    ✓ Face Captured
                  </Typography>
                  <img src={faceImage} alt="Face" style={{ width: '100%', borderRadius: 8, border: '2px solid #00ff88' }} />
                  <ImageQualityCheck imageData={faceImage} />
                  <ButtonGroup fullWidth sx={{ mt: 2 }}>
                    <Button 
                      startIcon={<CameraAlt />} 
                      onClick={() => { setFaceImage(null); setShowWebcam(true); }}
                      sx={{
                        bgcolor: '#00ff88',
                        color: '#000',
                        fontWeight: 600,
                        py: 1.5,
                        '&:hover': { bgcolor: '#00cc6a' }
                      }}
                    >
                      Recapture
                    </Button>
                    <Button 
                      startIcon={<Upload />} 
                      onClick={() => { setFaceImage(null); faceUploadRef.current.click(); }}
                      sx={{
                        bgcolor: '#ff9800',
                        color: '#000',
                        fontWeight: 600,
                        py: 1.5,
                        '&:hover': { bgcolor: '#f57c00' }
                      }}
                    >
                      Reupload
                    </Button>
                  </ButtonGroup>
                </Box>
              )}
              </Box>
              
              <Box sx={{ 
                bgcolor: '#1a1a1a', 
                p: 4, 
                borderRadius: 3, 
                mb: 3,
                border: '2px solid #ff9800',
                boxShadow: '0 4px 20px rgba(255,152,0,0.2)'
              }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#ff9800', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FingerprintOutlined sx={{ fontSize: 40 }} />
                  Step 2: Fingerprint Verification
                </Typography>
                <Typography variant="body1" sx={{ color: '#ccc', mb: 3, fontSize: '1.1rem' }}>
                  Capture or upload your thumbprint
                </Typography>
              
              {useHardwareScanner && !fingerprintImage && (
                <HardwareFingerprintScanner 
                  onCapture={(imageData, credentialData) => {
                    setFingerprintImage(imageData);
                  }}
                  username="verify"
                  mode="authenticate"
                />
              )}
              
              {!useHardwareScanner && !showFpWebcam && !fingerprintImage && (
                <>
                  <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: '#fff', fontWeight: 600 }}>
                    Choose how to capture your thumbprint:
                  </Typography>
                  <ButtonGroup fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <Button 
                      startIcon={<CameraAlt />} 
                      onClick={() => setShowFpWebcam(true)}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'rgba(102,126,234,0.1)' }
                      }}
                    >
                      Open Camera
                    </Button>
                    <Button 
                      startIcon={<Upload />} 
                      onClick={() => fpUploadRef.current.click()}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'rgba(102,126,234,0.1)' }
                      }}
                    >
                      Upload Image
                    </Button>
                  </ButtonGroup>
                </>
              )}
              
              {!useHardwareScanner && (
                <>
                  <input type="file" hidden ref={fpUploadRef} accept="image/*" capture="environment" onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = () => setFingerprintImage(r.result);
                      r.readAsDataURL(f);
                    }
                  }} />
                  {showFpWebcam && (
                    <WorkingBiometricCapture 
                      type="thumb"
                      onCapture={(imageData) => {
                        setFingerprintImage(imageData);
                        setShowFpWebcam(false);
                      }}
                      onCancel={() => setShowFpWebcam(false)}
                    />
                  )}
                </>
              )}
              
              {fingerprintImage && (
                <Fade in={true}>
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#000', borderRadius: 2, border: '2px solid #ff9800' }}>
                    <Typography variant="body1" sx={{ color: '#ff9800', mb: 2, fontWeight: 600 }}>
                      ✓ Fingerprint Captured
                    </Typography>
                    <img src={fingerprintImage} alt="Fingerprint" style={{ width: '100%', borderRadius: 8, border: '2px solid #ff9800' }} />
                    <ImageQualityCheck imageData={fingerprintImage} />
                    <ButtonGroup fullWidth sx={{ mt: 2 }}>
                      <Button 
                        onClick={() => { setFingerprintImage(null); }}
                        sx={{
                          bgcolor: '#ff9800',
                          color: '#000',
                          fontWeight: 600,
                          py: 1.5,
                          '&:hover': { bgcolor: '#f57c00' }
                        }}
                      >
                        Rescan
                      </Button>
                      {!useHardwareScanner && (
                        <Button 
                          startIcon={<Upload />} 
                          onClick={() => { setFingerprintImage(null); fpUploadRef.current.click(); }}
                          sx={{
                            bgcolor: '#00ff88',
                            color: '#000',
                            fontWeight: 600,
                            py: 1.5,
                            '&:hover': { bgcolor: '#00cc6a' }
                          }}
                        >
                          Reupload
                        </Button>
                      )}
                    </ButtonGroup>
                  </Box>
                </Fade>
              )}
              
              <Divider sx={{ my: 3, borderColor: '#333' }} />
              <Button 
                fullWidth 
                variant="outlined"
                size="large"
                onClick={() => setUseHardwareScanner(!useHardwareScanner)}
                sx={{ 
                  mb: 3, 
                  color: '#2196f3',
                  borderColor: '#2196f3',
                  fontWeight: 600,
                  py: 1.5,
                  fontSize: '1rem',
                  '&:hover': {
                    borderColor: '#2196f3',
                    bgcolor: 'rgba(33,150,243,0.1)'
                  }
                }}
              >
                {useHardwareScanner ? '← Back to Camera/Upload' : '🔐 Use Fingerprint Scanner (Windows Hello)'}
              </Button>
              
              {faceImage && fingerprintImage && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 3, 
                    borderRadius: 2,
                    bgcolor: 'rgba(33,150,243,0.1)',
                    border: '2px solid #2196f3',
                    '& .MuiAlert-icon': { color: '#2196f3' }
                  }}
                >
                  <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                    <strong style={{ color: '#2196f3' }}>Active Threshold: {customThreshold}</strong>
                    <br />• Verification will use YOUR custom threshold setting
                    <br />• If distance &gt; {customThreshold}, verification will fail
                    <br />• Adjust slider above to change strictness before verifying
                  </Typography>
                </Alert>
              )}
              
              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                onClick={handleVerify} 
                disabled={loading || !faceImage || !fingerprintImage} 
                sx={{ 
                  mt: 4,
                  py: 2.5,
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '1.3rem',
                  borderRadius: 2,
                  border: '3px solid #00ff88',
                  boxShadow: '0 4px 20px rgba(0,255,136,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00cc6a 0%, #00ff88 100%)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,255,136,0.6)'
                  },
                  '&:disabled': {
                    background: '#333',
                    color: '#666',
                    border: '3px solid #333'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <CircularProgress size={32} sx={{ color: '#000' }} />
                ) : (
                  <>
                    <Fingerprint sx={{ mr: 1, fontSize: 32 }} />
                    Verify Biometrics
                  </>
                )}
              </Button>
              </Box>
            </Box>
          )}
          {result && (
            <Button 
              fullWidth 
              variant="outlined" 
              size="large"
              onClick={() => { 
                setResult(null); 
                setFaceImage(null); 
                setFingerprintImage(null); 
                setShowWebcam(false); 
                setShowFpWebcam(false); 
              }} 
              sx={{ 
                mt: 3,
                py: 1.5,
                borderWidth: 2,
                borderColor: '#667eea',
                color: '#667eea',
                fontWeight: 600,
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#764ba2',
                  color: '#764ba2',
                  background: 'rgba(102,126,234,0.05)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Verify Again
            </Button>
          )}
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default BiometricVerify;