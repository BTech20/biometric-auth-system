import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Stepper, Step, StepLabel, ButtonGroup, Fade, Slide, InputAdornment, IconButton, Divider, CircularProgress } from '@mui/material';
import { CameraAlt, Upload, Person, Email, Lock, Visibility, VisibilityOff, HowToReg } from '@mui/icons-material';
import { authService } from '../services/api';
import HardwareFingerprintScanner from '../components/HardwareFingerprintScanner';
import ImageQualityCheck from '../components/ImageQualityCheck';
import BiometricCaptureNew from '../components/BiometricCaptureNew';

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
      bgcolor: '#0a0a0a',
      py: 4
    }}>
      <Container maxWidth="md">
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
                <HowToReg sx={{ fontSize: 50, color: '#000' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#00ff88', mb: 1 }}>
                Create Account
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>
                Register with secure biometric authentication
              </Typography>
            </Box>
            
            <Stepper activeStep={activeStep} sx={{ 
              my: 4,
              '& .MuiStepLabel-label': { color: '#aaa', fontWeight: 500 },
              '& .MuiStepLabel-label.Mui-active': { color: '#00ff88', fontWeight: 700 },
              '& .MuiStepLabel-label.Mui-completed': { color: '#00ff88' },
              '& .MuiStepIcon-root': { color: '#333' },
              '& .MuiStepIcon-root.Mui-active': { color: '#00ff88' },
              '& .MuiStepIcon-root.Mui-completed': { color: '#00ff88' }
            }}>
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
                      startAdornment: <InputAdornment position="start"><Person sx={{ color: 'rgba(255,255,255,0.7)' }} /></InputAdornment> 
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
                    label="Email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><Email sx={{ color: 'rgba(255,255,255,0.7)' }} /></InputAdornment> 
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
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'rgba(255,255,255,0.7)' }} /></InputAdornment>,
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
                </Box>
              </Fade>
            )}
          
          {activeStep === 1 && (
            <>
              {!showWebcam && !faceImage && (
                <ButtonGroup fullWidth variant="outlined" sx={{ 
                  mb: 2,
                  '& .MuiButton-root': {
                    color: 'rgba(255,255,255,0.9)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': { 
                      borderColor: '#00ff88', 
                      bgcolor: 'rgba(0,255,136,0.1)',
                      color: '#00ff88'
                    }
                  }
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
                <BiometricCaptureNew 
                  type="face"
                  onCapture={(imageData) => {
                    setFaceImage(imageData);
                    setShowWebcam(false);
                  }}
                  onCancel={() => setShowWebcam(false)}
                />
              )}
              {faceImage && !showWebcam && (
                <Box sx={{ mb: 2 }}>
                  <img src={faceImage} alt="Face" style={{ width: '100%', borderRadius: 8 }} />
                  <ImageQualityCheck imageData={faceImage} />
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
                      }
                    }
                  }}>
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
                  <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: '#fff', fontWeight: 600 }}>
                    Choose how to capture your thumbprint:
                  </Typography>
                  <ButtonGroup fullWidth variant="outlined" sx={{ 
                    mb: 2,
                    '& .MuiButton-root': {
                      color: 'rgba(255,255,255,0.9)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': { 
                        borderColor: '#00ff88',
                        bgcolor: 'rgba(0,255,136,0.1)',
                        color: '#00ff88'
                      }
                    }
                  }}>
                    <Button 
                      startIcon={<CameraAlt />} 
                      onClick={() => setShowFpWebcam(true)}
                    >
                      Open Camera
                    </Button>
                    <Button 
                      startIcon={<Upload />} 
                      onClick={() => fpUploadRef.current.click()}
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
                    <BiometricCaptureNew 
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
                  <Box sx={{ mb: 2 }}>
                    <img src={fingerprintImage} alt="Fingerprint" style={{ width: '100%', borderRadius: 8 }} />
                    <ImageQualityCheck imageData={fingerprintImage} />
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
                        }
                      }
                    }}>
                      <Button onClick={() => { setFingerprintImage(null); }}>Rescan</Button>
                      {!useHardwareScanner && (
                        <Button startIcon={<Upload />} onClick={() => { setFingerprintImage(null); fpUploadRef.current.click(); }}>Reupload</Button>
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
                sx={{ color: '#00ff88', fontWeight: 600 }}
              >
                {useHardwareScanner ? '← Back to Camera/Upload' : '🔐 Use Fingerprint Scanner (Requires Windows Hello)'}
              </Button>
            </>
          )}
          
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button 
                disabled={activeStep === 0} 
                onClick={() => setActiveStep(activeStep - 1)}
                variant="contained"
                size="large"
                sx={{ 
                  px: 4,
                  bgcolor: '#00ff88',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: '#00cc6a',
                    transform: 'translateX(-4px)',
                    boxShadow: '0 0 20px rgba(0,255,136,0.5)'
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.3)'
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
                    bgcolor: '#00ff88',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    boxShadow: '0 0 20px rgba(0,255,136,0.4)',
                    '&:hover': {
                      bgcolor: '#00cc6a',
                      transform: 'translateX(4px)',
                      boxShadow: '0 0 30px rgba(0,255,136,0.6)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#000' }} /> : 'Create Account'}
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  size="large"
                  sx={{ 
                    px: 4,
                    bgcolor: '#00ff88',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    boxShadow: '0 0 20px rgba(0,255,136,0.4)',
                    '&:hover': {
                      bgcolor: '#00cc6a',
                      transform: 'translateX(4px)',
                      boxShadow: '0 0 30px rgba(0,255,136,0.6)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
            
            <Typography align="center" variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#00ff88',
                  textDecoration: 'none',
                  fontWeight: 700
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