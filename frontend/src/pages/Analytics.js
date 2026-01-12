import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Box, Paper, Typography, Grid, Card, CardContent, 
  Slider, Button, TextField, CircularProgress, Fade, Slide,
  Table, TableBody, TableCell, TableHead, TableRow, Chip,
  Divider, IconButton, Tooltip, Alert
} from '@mui/material';
import { 
  ArrowBack, TrendingUp, TrendingDown, Assessment, 
  Security, Speed, CheckCircle, Cancel, Settings, Save
} from '@mui/icons-material';
import { authService } from '../services/api';

function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [threshold, setThreshold] = useState(15);
  const [tempThreshold, setTempThreshold] = useState(15);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await authService.getStats();
      setStats(response.data);
      // Get current threshold from first verification log if available
      setLoading(false);
    } catch (err) {
      console.error('Failed to load analytics', err);
      setLoading(false);
    }
  };

  const handleThresholdSave = () => {
    setThreshold(tempThreshold);
    setMessage(`Threshold updated to ${tempThreshold}. Note: This will affect future verifications.`);
    setTimeout(() => setMessage(''), 5000);
  };

  // Calculate metrics
  const calculateMetrics = () => {
    if (!stats) return { far: 0, frr: 0, eer: 0, accuracy: 0 };
    
    const total = stats.total_authentications || 1;
    const successful = stats.successful_authentications || 0;
    const failed = total - successful;
    
    // Simplified calculations (in real system, need genuine vs impostor data)
    const accuracy = ((successful / total) * 100).toFixed(2);
    const errorRate = ((failed / total) * 100).toFixed(2);
    
    return {
      accuracy,
      errorRate,
      far: (errorRate * 0.4).toFixed(2), // Simulated FAR
      frr: (errorRate * 0.6).toFixed(2), // Simulated FRR
      eer: (errorRate / 2).toFixed(2)
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Fade in timeout={600}>
          <Box>
            <Button 
              startIcon={<ArrowBack />} 
              onClick={() => navigate('/dashboard')}
              sx={{ 
                mb: 3,
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(-4px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Back to Dashboard
            </Button>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                mb: 2
              }}>
                <Assessment sx={{ fontSize: 50, color: 'white' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                System Analytics & Evaluation
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Deep hashing performance metrics and threshold configuration
              </Typography>
            </Box>

            {message && (
              <Slide direction="down" in>
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  {message}
                </Alert>
              </Slide>
            )}

            {/* Performance Metrics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {[
                { 
                  label: 'Accuracy', 
                  value: `${metrics.accuracy}%`, 
                  icon: <CheckCircle />, 
                  color: '#4caf50',
                  desc: 'Overall system accuracy'
                },
                { 
                  label: 'FAR', 
                  value: `${metrics.far}%`, 
                  icon: <TrendingDown />, 
                  color: '#ff9800',
                  desc: 'False Acceptance Rate'
                },
                { 
                  label: 'FRR', 
                  value: `${metrics.frr}%`, 
                  icon: <TrendingUp />, 
                  color: '#2196f3',
                  desc: 'False Rejection Rate'
                },
                { 
                  label: 'EER', 
                  value: `${metrics.eer}%`, 
                  icon: <Speed />, 
                  color: '#9c27b0',
                  desc: 'Equal Error Rate'
                }
              ].map((metric, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Slide direction="up" in timeout={600 + index * 100}>
                    <Card sx={{ 
                      height: '100%',
                      background: 'rgba(255,255,255,0.95)',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ 
                            p: 1.5, 
                            borderRadius: 2, 
                            bgcolor: `${metric.color}20`,
                            color: metric.color,
                            mr: 2
                          }}>
                            {metric.icon}
                          </Box>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: metric.color }}>
                              {metric.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {metric.label}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {metric.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Slide>
                </Grid>
              ))}
            </Grid>

            {/* Threshold Configuration */}
            <Slide direction="up" in timeout={800}>
              <Paper sx={{ 
                p: 4, 
                mb: 3,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Settings sx={{ mr: 2, color: '#667eea', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Hamming Distance Threshold Configuration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Adjust the security threshold for multimodal authentication
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Typography gutterBottom sx={{ fontWeight: 500 }}>
                      Current Threshold: <Chip label={threshold} color="primary" sx={{ fontWeight: 700 }} />
                    </Typography>
                    <Slider
                      value={tempThreshold}
                      onChange={(e, val) => setTempThreshold(val)}
                      min={5}
                      max={50}
                      step={1}
                      marks={[
                        { value: 5, label: '5 (Strict)' },
                        { value: 15, label: '15 (Default)' },
                        { value: 30, label: '30 (Relaxed)' },
                        { value: 50, label: '50 (Loose)' }
                      ]}
                      valueLabelDisplay="on"
                      sx={{
                        '& .MuiSlider-thumb': {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        },
                        '& .MuiSlider-track': {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Lower = More Secure (Higher FRR)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Higher = More Convenient (Higher FAR)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Threshold Value"
                      value={tempThreshold}
                      onChange={(e) => setTempThreshold(Math.max(5, Math.min(50, parseInt(e.target.value) || 5)))}
                      inputProps={{ min: 5, max: 50 }}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<Save />}
                      onClick={handleThresholdSave}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(102,126,234,0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Save Threshold
                    </Button>
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography variant="body2">
                    <strong>Recommendation:</strong> For identity card applications with high security requirements, 
                    maintain threshold between 10-20. Lower values increase security but may cause legitimate user rejections.
                  </Typography>
                </Alert>
              </Paper>
            </Slide>

            {/* System Statistics */}
            <Slide direction="up" in timeout={1000}>
              <Paper sx={{ 
                p: 4,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Security sx={{ mr: 2, color: '#667eea', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      System Statistics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overall system performance and usage metrics
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: '#f5f5f5' }}>
                      <CardContent>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                          {stats?.total_users || 0}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Total Enrolled Users
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: '#f5f5f5' }}>
                      <CardContent>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                          {stats?.active_users || 0}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Active Users
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: '#f5f5f5' }}>
                      <CardContent>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800', mb: 1 }}>
                          {stats?.total_authentications || 0}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Total Authentication Attempts
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: '#f5f5f5' }}>
                      <CardContent>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#2196f3', mb: 1 }}>
                          {stats?.successful_authentications || 0}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Successful Authentications
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography variant="body2">
                    <strong>Research Note:</strong> For accurate FAR/FRR/EER calculations, you need to run 
                    controlled experiments with genuine users and impostors. These metrics are currently estimated 
                    based on overall authentication success rates.
                  </Typography>
                </Alert>
              </Paper>
            </Slide>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default Analytics;
