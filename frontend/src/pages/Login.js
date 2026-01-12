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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ 
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mb: 2
              }}>
                <Fingerprint sx={{ fontSize: 50, color: 'white' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem'
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
                    startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> 
                  }}
                  sx={{ mb: 2 }}
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
                    startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(102,126,234,0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }} 
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
                </Button>
              </form>
            </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 2 }}>1. Face Verification</Typography>
            {!showWebcam && !faceImage && (
              <ButtonGroup fullWidth variant="outlined" sx={{ mb: 2 }}>
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
                  <Button variant="contained" onClick={() => { setFaceImage(webcamRef.current.getScreenshot()); setShowWebcam(false); }}>Capture</Button>
                  <Button variant="outlined" onClick={() => setShowWebcam(false)}>Cancel</Button>
                </ButtonGroup>
              </Box>
            )}
            {faceImage && !showWebcam && (
              <Box sx={{ mb: 2 }}>
                <img src={faceImage} alt="Face" style={{ width: '100%', borderRadius: 8 }} />
                <ButtonGroup fullWidth sx={{ mt: 1 }}>
                  <Button startIcon={<CameraAlt />} onClick={() => { setFaceImage(null); setShowWebcam(true); }}>Recapture</Button>
                  <Button startIcon={<Upload />} onClick={() => { setFaceImage(null); faceUploadRef.current.click(); }}>Reupload</Button>
                </ButtonGroup>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>2. Fingerprint Verification</Typography>
            
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
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
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          py: 1.5,
                          fontWeight: 600
                        }}
                      >
                        Capture Thumb
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => setShowFpWebcam(false)}
                        sx={{ py: 1.5 }}
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
                  <ButtonGroup fullWidth sx={{ mt: 1 }}>
                    <Button onClick={() => { setFingerprintImage(null); }}>Rescan</Button>
                    {!useHardwareScanner && (
                      <Button startIcon={<Upload />} onClick={() => { setFingerprintImage(null); fingerprintInputRef.current.click(); }}>Reupload</Button>
                    )}
                  </ButtonGroup>
                </Box>
              </Fade>
            )}
            
            <Divider sx={{ my: 2 }} />
            <Button 
              fullWidth 
              variant="text" 
              size="small"
              onClick={() => setUseHardwareScanner(!useHardwareScanner)}
              sx={{ mb: 2, color: '#667eea' }}
            >
              {useHardwareScanner ? '← Back to Camera/Upload' : '🔐 Use Dell Fingerprint Scanner (Requires Windows Hello)'}
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(102,126,234,0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Authenticate with Biometrics'}
            </Button>
          </TabPanel>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography align="center" variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 600
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