import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Stepper, Step, StepLabel, ButtonGroup, Fade, Slide, InputAdornment, IconButton, Divider, CircularProgress } from '@mui/material';
import { CameraAlt, Upload, Person, Email, Lock, Visibility, VisibilityOff, HowToReg } from '@mui/icons-material';
import Webcam from 'react-webcam';
import { authService } from '../services/api';
import HardwareFingerprintScanner from '../components/HardwareFingerprintScanner';
import ImageQualityCheck from '../components/ImageQualityCheck';

const steps = ['Account Details', 'Face Capture', 'Fingerprint Scan'];

function Register({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
  const fpUploadRef = useRef(null);

  const handleNext = () => {
    if (activeStep === 0 && (!username || !email || !password)) {
      setError('Fill all fields');
      return;
    }
    if (activeStep === 1 && !faceImage) {
      setError('Capture face');
      return;
    }
    if (activeStep === 2 && !fingerprintImage) {
      setError('Upload fingerprint');
      return;
    }
    setError('');
    if (activeStep < 2) setActiveStep(activeStep + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await authService.register({
        username, email, password, face_image: faceImage, fingerprint_image: fingerprintImage
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ id: response.data.user_id, username: response.data.username }));
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
      <Container maxWidth="md">
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
                <HowToReg sx={{ fontSize: 50, color: 'white' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Register with secure biometric authentication
              </Typography>
            </Box>
            
            <Stepper activeStep={activeStep} sx={{ my: 4 }}>
              {steps.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {error && (
              <Slide direction="down" in>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Slide>
            )}
            
            {activeStep === 0 && (
              <Fade in>
                <Box>
                  <TextField 
                    fullWidth 
                    margin="normal" 
                    label="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> 
                    }}
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    fullWidth 
                    margin="normal" 
                    label="Email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> 
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
                </Box>
              </Fade>
            )}
          
          {activeStep === 1 && (
            <>
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
                  <Webcam audio={false} ref={webcamRef} width="100%" screenshotFormat="image/jpeg" />
                  <ButtonGroup fullWidth sx={{ mt: 1 }}>
                    <Button variant="contained" onClick={() => { setFaceImage(webcamRef.current.getScreenshot()); setShowWebcam(false); }}>Capture</Button>
                    <Button variant="outlined" onClick={() => setShowWebcam(false)}>Cancel</Button>
                  </ButtonGroup>
                </Box>
              )}
              {faceImage && !showWebcam && (
                <Box sx={{ mb: 2 }}>
                  <img src={faceImage} alt="Face" style={{ width: '100%', borderRadius: 8 }} />
                  <ImageQualityCheck imageData={faceImage} />
                  <ButtonGroup fullWidth sx={{ mt: 1 }}>
                    <Button startIcon={<CameraAlt />} onClick={() => { setFaceImage(null); setShowWebcam(true); }}>Recapture</Button>
                    <Button startIcon={<Upload />} onClick={() => { setFaceImage(null); faceUploadRef.current.click(); }}>Reupload</Button>
                  </ButtonGroup>
                </Box>
              )}
            </>
          )}
          
          {activeStep === 2 && (
            <>
              {useHardwareScanner && !fingerprintImage && (
                <HardwareFingerprintScanner 
                  onCapture={(imageData, credentialData) => {
                    setFingerprintImage(imageData);
                  }}
                  username={username}
                  mode="register"
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
                    <Box sx={{ mb: 2 }}>
                      <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                        <Typography variant="body2">
                          Hold your thumb clearly in front of the camera, then click "Capture Thumb"
                        </Typography>
                      </Alert>
                      <Webcam audio={false} ref={fpWebcamRef} width="100%" screenshotFormat="image/jpeg" />
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
                    <ImageQualityCheck imageData={fingerprintImage} />
                    <ButtonGroup fullWidth sx={{ mt: 1 }}>
                      <Button onClick={() => { setFingerprintImage(null); }}>Rescan</Button>
                      {!useHardwareScanner && (
                        <Button startIcon={<Upload />} onClick={() => { setFingerprintImage(null); fpUploadRef.current.click(); }}>Reupload</Button>
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
                sx={{ color: '#667eea' }}
              >
                {useHardwareScanner ? '← Back to Camera/Upload' : '🔐 Use Dell Fingerprint Scanner (Requires Windows Hello)'}
              </Button>
            </>
          )}
          
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button 
                disabled={activeStep === 0} 
                onClick={() => setActiveStep(activeStep - 1)}
                size="large"
                sx={{ 
                  px: 4,
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateX(-4px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Back
              </Button>
              {activeStep === 2 ? (
                <Button 
                  variant="contained" 
                  onClick={handleSubmit} 
                  disabled={loading}
                  size="large"
                  sx={{ 
                    px: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      transform: 'translateX(4px)',
                      boxShadow: '0 8px 24px rgba(102,126,234,0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Account'}
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  size="large"
                  sx={{ 
                    px: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      transform: 'translateX(4px)',
                      boxShadow: '0 8px 24px rgba(102,126,234,0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography align="center" variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default Register;