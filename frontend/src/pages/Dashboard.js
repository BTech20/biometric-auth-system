import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, Grid, Card, CardContent, AppBar, Toolbar, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Chip, Avatar, Fade, Slide, IconButton, Tooltip } from '@mui/material';
import { ExitToApp, Fingerprint, VerifiedUser, Person, CheckCircle, Cancel, Dashboard as DashboardIcon, Assessment, Security, ShowChart } from '@mui/icons-material';
import { authService } from '../services/api';

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([authService.getProfile(), authService.getStats()])
      .then(([p, s]) => { setProfile(p.data); setStats(s.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <CircularProgress size={70} sx={{ color: '#00ff88', mb: 3 }} />
      <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 600 }}>Loading Dashboard...</Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', pb: 4 }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#1a1a1a', borderBottom: '2px solid #00ff88' }}>
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
            mr: 2
          }}>
            <Fingerprint sx={{ fontSize: 36, color: '#000' }} />
          </Box>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 800, color: '#00ff88' }}>Biometric Security System</Typography>
          <Tooltip title="Logout" arrow>
            <Button
              variant="contained"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              sx={{
                bgcolor: '#ff4444',
                color: '#000',
                fontWeight: 700,
                px: 3,
                '&:hover': {
                  bgcolor: '#cc0000',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Logout
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Fade in timeout={800}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Slide direction="right" in timeout={600}>
                <Card sx={{ 
                  bgcolor: '#1a1a1a', 
                  border: '2px solid #00ff88',
                  boxShadow: '0 8px 32px rgba(0,255,136,0.3)',
                  height: '100%',
                  borderRadius: 3
                }}>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Avatar sx={{ 
                        width: 120, 
                        height: 120, 
                        mx: 'auto', 
                        mb: 3, 
                        background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                        border: '4px solid #000',
                        boxShadow: '0 4px 20px rgba(0,255,136,0.4)'
                      }}>
                        <Person sx={{ fontSize: 70, color: '#000' }} />
                      </Avatar>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#00ff88' }}>{profile?.username}</Typography>
                      <Typography variant="h6" sx={{ color: '#999', mb: 3 }}>{profile?.email}</Typography>
                      <Chip 
                        icon={profile?.is_active ? <CheckCircle /> : <Cancel />}
                        label={profile?.is_active ? 'Account Active' : 'Account Inactive'} 
                        sx={{ 
                          bgcolor: profile?.is_active ? '#00ff88' : '#ff4444',
                          color: '#000',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          height: 36,
                          mb: 4,
                          border: '2px solid #000'
                        }} 
                      />
                      <Button 
                        fullWidth 
                        variant="contained" 
                        size="large"
                        startIcon={<VerifiedUser sx={{ fontSize: 28 }} />} 
                        onClick={() => navigate('/verify')} 
                        sx={{ 
                          background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                          color: '#000',
                          mb: 2,
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          border: '2px solid #00ff88',
                          boxShadow: '0 4px 20px rgba(0,255,136,0.4)',
                          '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 30px rgba(0,255,136,0.6)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Verify Biometrics
                      </Button>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        size="large"
                        startIcon={<ShowChart sx={{ fontSize: 28 }} />} 
                        onClick={() => navigate('/analytics')} 
                        sx={{ 
                          bgcolor: '#ff9800',
                          color: '#000',
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          border: '2px solid #ff9800',
                          boxShadow: '0 4px 20px rgba(255,152,0,0.4)',
                          '&:hover': { 
                            bgcolor: '#f57c00',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 30px rgba(255,152,0,0.6)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        View Analytics
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Fade in timeout={1000}>
                <Box>
                  <Grid container spacing={3}>
                    {[
                      { icon: <DashboardIcon sx={{ fontSize: 50 }} />, value: stats?.total_users || 0, label: 'Total Users', color: '#00ff88', bg: 'rgba(0,255,136,0.1)' },
                      { icon: <Person sx={{ fontSize: 50 }} />, value: stats?.active_users || 0, label: 'Active Users', color: '#00ff88', bg: 'rgba(0,255,136,0.1)' },
                      { icon: <Security sx={{ fontSize: 50 }} />, value: stats?.total_authentications || 0, label: 'Total Auth', color: '#ff9800', bg: 'rgba(255,152,0,0.1)' },
                      { icon: <Assessment sx={{ fontSize: 50 }} />, value: `${stats?.success_rate?.toFixed(1) || 0}%`, label: 'Success Rate', color: '#2196f3', bg: 'rgba(33,150,243,0.1)' },
                    ].map((stat, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Slide direction="up" in timeout={600 + index * 100}>
                          <Card sx={{ 
                            height: '100%',
                            bgcolor: '#1a1a1a',
                            border: `2px solid ${stat.color}`,
                            borderRadius: 3,
                            boxShadow: `0 4px 20px ${stat.color}40`,
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-8px) scale(1.02)',
                              boxShadow: `0 12px 40px ${stat.color}60`
                            }
                          }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                  <Typography variant="h3" sx={{ fontWeight: 800, color: stat.color, mb: 1 }}>
                                    {stat.value}
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: '#999', fontWeight: 600 }}>
                                    {stat.label}
                                  </Typography>
                                </Box>
                                <Box sx={{ 
                                  p: 2, 
                                  borderRadius: 3, 
                                  bgcolor: stat.bg,
                                  border: `2px solid ${stat.color}`,
                                  color: stat.color
                                }}>
                                  {stat.icon}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Slide>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Slide direction="up" in timeout={1200}>
                    <Card sx={{ 
                      mt: 4, 
                      overflow: 'hidden',
                      bgcolor: '#1a1a1a',
                      border: '2px solid #2196f3',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(33,150,243,0.3)'
                    }}>
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: '#000',
                        borderBottom: '2px solid #2196f3'
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', color: '#2196f3' }}>
                          <Security sx={{ mr: 2, fontSize: 36 }} />
                          Recent Authentication History
                        </Typography>
                      </Box>
                      <CardContent sx={{ p: 0 }}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#000' }}>
                              <TableCell sx={{ fontWeight: 700, color: '#00ff88', fontSize: '1rem', border: 'none' }}>Timestamp</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: '#00ff88', fontSize: '1rem', border: 'none' }}>Method</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: '#00ff88', fontSize: '1rem', border: 'none' }}>Distance</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: '#00ff88', fontSize: '1rem', border: 'none' }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {profile?.recent_logins?.map((log, i) => (
                              <TableRow 
                                key={i}
                                sx={{ 
                                  bgcolor: i % 2 === 0 ? '#1a1a1a' : '#252525',
                                  '&:hover': { bgcolor: '#2d2d2d' },
                                  transition: 'background-color 0.2s ease'
                                }}
                              >
                                <TableCell sx={{ border: 'none' }}>
                                  <Typography variant="body1" sx={{ color: '#ccc', fontWeight: 500 }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ border: 'none' }}>
                                  <Chip 
                                    label={log.auth_method.toUpperCase()} 
                                    sx={{ 
                                      bgcolor: log.auth_method === 'biometric' ? '#2196f3' : '#ff9800',
                                      color: '#000',
                                      fontWeight: 700,
                                      border: '2px solid #000'
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ border: 'none' }}>
                                  <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#ff9800', fontWeight: 700 }}>
                                    {log.hamming_distance?.toFixed(2) || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ border: 'none' }}>
                                  <Chip
                                    icon={log.success ? <CheckCircle /> : <Cancel />}
                                    label={log.success ? 'SUCCESS' : 'FAILED'}
                                    sx={{
                                      bgcolor: log.success ? '#00ff88' : '#ff4444',
                                      color: '#000',
                                      fontWeight: 700,
                                      border: '2px solid #000'
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Slide>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
}

export default Dashboard;