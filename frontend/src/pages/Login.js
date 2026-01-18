import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Tab, Tabs, CircularProgress, Divider, ButtonGroup, Fade, Slide, InputAdornment, IconButton } from '@mui/material';
import { Fingerprint, Face, Lock, Person, CameraAlt, Upload, Visibility, VisibilityOff } from '@mui/icons-material';
import Webcam from 'react-webcam';
import { authService } from '../services/api';
import HardwareFingerprintScanner from '../components/HardwareFingerprintScanner';

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [showFpWebcam, setShowFpWebcam] = useState(false);
  const [useHardwareScanner, setUseHardwareScanner] = useState(false);
  const webcamRef = useRef(null);
  const fpWebcamRef = useRef(null);
  const faceUploadRef = useRef(null);
  const fingerprintInputRef = useRef(null);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.loginWithPassword({ username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ id: response.data.user_id, username: response.data.username }));
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!faceImage || !fingerprintImage) {
      setError('Please provide both biometrics');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authService.loginWithBiometrics({ face_image: faceImage, fingerprint_image: fingerprintImage });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ id: response.data.user_id, username: response.data.username }));
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      bgcolor: '#0a0a0a',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,255,136,0.3)',
            bgcolor: '#1a1a1a',
            border: '2px solid #00ff88'
          }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ 
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                mb: 2
              }}>
                <Fingerprint sx={{ fontSize: 50, color: '#000' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#00ff88', mb: 1 }}>
                Authentication
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>
                Secure biometric authentication system
              </Typography>
            </Box>
            
            {error && (
              <Slide direction="down" in>
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Slide>
            )}
            
            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)} 
              centered
              sx={{
                mb: 2,
                '& .MuiTab-root': {
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&.Mui-selected': {
                    color: '#2196f3'
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#fff'
                  },
                  '&.Mui-selected .MuiSvgIcon-root': {
                    color: '#2196f3'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#2196f3',
                  height: 3
                }
              }}
            >
              <Tab label="Password Login" icon={<Lock />} iconPosition="start" />
              <Tab label="Biometric Login" icon={<Face />} iconPosition="start" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <form onSubmit={handlePasswordLogin}>
                <TextField 
                  fullWidth 
                  margin="normal" 
                  label="Username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><Person sx={{ color: '#fff' }} /></InputAdornment> 
                  }}
                  sx={{ 
                    mb: 2,
                    '& .MuiInputBase-input': { color: '#fff', fontWeight: 500 },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#00ff88' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                    }
                  }}
                />
                <TextField 
                  fullWidth 
                  margin="normal" 
                  label="Password" 
                  type={showPassword ? 'text' : 'password'}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#fff' }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#fff', fontWeight: 500 },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#00ff88' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                    }
                  }}
                />
                <Button 
                  fullWidth 
                  variant="contained" 
                  type="submit" 
                  size="large"
                  sx={{ 
                    mt: 3,
                    py: 1.5,
                    bgcolor: '#00ff88',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    boxShadow: '0 0 20px rgba(0,255,136,0.4)',
                    '&:hover': {
                      bgcolor: '#00cc6a',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 0 30px rgba(0,255,136,0.6)'
                    },
                    transition: 'all 0.3s ease'
                  }} 
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#000' }} /> : 'Sign In'}
                </Button>
              </form>
            </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>1. Face Verification</Typography>
            {!showWebcam && !faceImage && (
              <ButtonGroup fullWidth variant="outlined" sx={{ 
                mb: 2,
                '& .MuiButton-root': {
                  color: '#2196f3',
                  borderColor: '#2196f3',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': { 
                    borderColor: '#1976d2',
                    bgcolor: 'rgba(33,150,243,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#2196f3'
                  }
                },
                transition: 'all 0.3s ease'
              }}>
                <Button startIcon={<CameraAlt />} onClick={() => setShowWebcam(true)}>Capture Face</Button>
                <Button startIcon={<Upload />} onClick={() => faceUploadRef.current.click()}>Upload Image</Button>
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
              <Box sx={{ mb: 2 }}>
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width="100%" />
                <ButtonGroup fullWidth sx={{ mt: 1 }}>
                  <Button 
                    variant="contained" 
                    onClick={() => { setFaceImage(webcamRef.current.getScreenshot()); setShowWebcam(false); }}
                    sx={{
                      bgcolor: '#00ff88',
                      color: '#000',
                      fontWeight: 700,
                      py: 1.5,
                      '&:hover': { bgcolor: '#00cc6a' }
                    }}
                  >
                    Capture
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setShowWebcam(false)}
                    sx={{ 
                      color: '#ff4444',
                      borderColor: '#ff4444',
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': { 
                        borderColor: '#cc0000', 
                        bgcolor: 'rgba(255,68,68,0.1)' 
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </ButtonGroup>
              </Box>
            )}
            {faceImage && !showWebcam && (
              <Box sx={{ mb: 2 }}>
                <img src={faceImage} alt="Face" style={{ width: '100%', borderRadius: 8 }} />
                <ButtonGroup fullWidth sx={{ 
                  mt: 1,
                  '& .MuiButton-root': {
                    color: 'rgba(255,255,255,0.9)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontWeight: 600,
                    '&:hover': { 
                      borderColor: '#00ff88',
                      bgcolor: 'rgba(0,255,136,0.1)',
                      color: '#00ff88'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'inherit'
                    }
                  }
                }}>
                  <Button startIcon={<CameraAlt />} onClick={() => { setFaceImage(null); setShowWebcam(true); }}>Recapture</Button>
                  <Button startIcon={<Upload />} onClick={() => { setFaceImage(null); faceUploadRef.current.click(); }}>Reupload</Button>
                </ButtonGroup>
              </Box>
            )}
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
            <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>2. Fingerprint Verification</Typography>
            
            {useHardwareScanner && !fingerprintImage && (
              <HardwareFingerprintScanner 
                onCapture={(imageData, credentialData) => {
                  setFingerprintImage(imageData);
                }}
                username={username}
                mode="authenticate"
              />
            )}
            
            {!useHardwareScanner && !showFpWebcam && !fingerprintImage && (
              <>
                <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: '#fff', fontWeight: 600 }}>
                  Choose how to capture your thumbprint:
                </Typography>
                <ButtonGroup fullWidth variant="outlined" sx={{ 
                  mb: 2,
                  '& .MuiButton-root': {
                    color: '#2196f3',
                    borderColor: '#2196f3',
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': { 
                      borderColor: '#1976d2',
                      bgcolor: 'rgba(33,150,243,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#2196f3'
                    }
                  },
                  transition: 'all 0.3s ease'
                }}>
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
                    onClick={() => fingerprintInputRef.current.click()}
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
                <input type="file" hidden ref={fingerprintInputRef} accept="image/*" capture="environment" onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = () => setFingerprintImage(r.result);
                    r.readAsDataURL(f);
                  }
                }} />
                {showFpWebcam && (
                  <Box sx={{ mb: 2 }}>
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                      <Typography variant="body2">
                        Hold your thumb clearly in front of the camera, then click "Capture Thumb"
                      </Typography>
                    </Alert>
                    <Webcam audio={false} ref={fpWebcamRef} screenshotFormat="image/jpeg" width="100%" />
                    <ButtonGroup fullWidth sx={{ mt: 1 }}>
                      <Button 
                        variant="contained" 
                        onClick={() => { 
                          setFingerprintImage(fpWebcamRef.current.getScreenshot()); 
                          setShowFpWebcam(false); 
                        }}
                        sx={{
                          bgcolor: '#00ff88',
                          color: '#000',
                          py: 1.5,
                          fontWeight: 700,
                          '&:hover': {
                            bgcolor: '#00cc6a'
                          }
                        }}
                      >
                        Capture Thumb
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => setShowFpWebcam(false)}
                        sx={{ 
                          py: 1.5,
                          color: '#ff4444',
                          borderColor: '#ff4444',
                          fontWeight: 600,
                          '&:hover': { 
                            borderColor: '#cc0000', 
                            bgcolor: 'rgba(255,68,68,0.1)' 
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </ButtonGroup>
                  </Box>
                )}
              </>
            )}
            
            {fingerprintImage && (
              <Fade in={true}>
                <Box sx={{ mb: 2 }}>
                  <img src={fingerprintImage} alt="Fingerprint" style={{ width: '100%', borderRadius: 8 }} />
                  <ButtonGroup fullWidth sx={{ 
                    mt: 1,
                    '& .MuiButton-root': {
                      color: 'rgba(255,255,255,0.9)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      fontWeight: 600,
                      '&:hover': { 
                        borderColor: '#00ff88',
                        bgcolor: 'rgba(0,255,136,0.1)',
                        color: '#00ff88'
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'inherit'
                      }
                    }
                  }}>
                    <Button onClick={() => { setFingerprintImage(null); }}>Rescan</Button>
                    {!useHardwareScanner && (
                      <Button startIcon={<Upload />} onClick={() => { setFingerprintImage(null); fingerprintInputRef.current.click(); }}>Reupload</Button>
                    )}
                  </ButtonGroup>
                </Box>
              </Fade>
            )}
            
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
            <Button 
              fullWidth 
              variant="text" 
              size="small"
              onClick={() => setUseHardwareScanner(!useHardwareScanner)}
              sx={{ mb: 2, color: '#00ff88', fontWeight: 600 }}
            >
              {useHardwareScanner ? '← Back to Camera/Upload' : '🔐 Use Fingerprint Scanner (Requires Windows Hello)'}
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={handleBiometricLogin} 
              disabled={loading || !faceImage || !fingerprintImage} 
              sx={{ 
                mt: 3,
                py: 1.5,
                bgcolor: '#00ff88',
                color: '#000',
                fontWeight: 800,
                fontSize: '1.1rem',
                boxShadow: '0 0 20px rgba(0,255,136,0.4)',
                '&:hover': {
                  bgcolor: '#00cc6a',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 30px rgba(0,255,136,0.6)'
                },
                '&.Mui-disabled': {
                  bgcolor: '#1a1a1a',
                  color: 'rgba(255,255,255,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#000' }} /> : 'Authenticate with Biometrics'}
            </Button>
          </TabPanel>
          
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
          
          <Typography align="center" variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#00ff88',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              Create Account
            </Link>
          </Typography>
        </Paper>
      </Fade>
    </Container>
  </Box>
  );
}

export default Login;