import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Checkbox,
  FormControlLabel,
  IconButton,
  useTheme,
  styled,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import {
  login,
  signup,
  loginWithGoogle,
  loginWithFacebook,
  loginWithGithub,
  forgotPassword,
  isAuthenticated,
} from '../services/auth';

interface AuthFormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: '40px',
  width: '100%',
  maxWidth: '450px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: theme.palette.light.main,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.accent.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.accent.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.light.main,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  padding: '12px',
  borderRadius: '8px',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(67, 97, 238, 0.3)',
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  width: '45px',
  height: '45px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: theme.palette.light.main,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)',
  },
}));

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!formData.name) {
          throw new Error('Name is required');
        }
        await signup(formData.name, formData.email, formData.password);
      }

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      await forgotPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
    try {
      switch (provider) {
        case 'google':
          await loginWithGoogle();
          break;
        case 'facebook':
          await loginWithFacebook();
          break;
        case 'github':
          await loginWithGithub();
          break;
      }
    } catch (err) {
      setError(`Failed to login with ${provider}`);
    }
  };

  return (
    <Container maxWidth="xl" sx={{
      backgroundColor: theme.palette.dark.main,
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.dark.main} 0%, ${theme.palette.dark.secondary} 100%)`,
          padding: '20px',
          width: '100%'
        }}
      >
        <StyledPaper>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.accent.main} 0%, ${theme.palette.primary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                letterSpacing: '2px',
                mb: 1,
              }}
            >
              EXPENSIOO
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.gray.main, letterSpacing: '1px' }}
            >
              Smart Financial Management
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {!isLogin && (
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              )}
              <StyledTextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <StyledTextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {!isLogin && (
                <StyledTextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword || ''}
                  onChange={handleChange}
                  required
                />
              )}
              {isLogin && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: theme.palette.accent.main,
                          '&.Mui-checked': {
                            color: theme.palette.accent.main,
                          },
                        }}
                      />
                    }
                    label="Remember me"
                    sx={{ color: theme.palette.light.main }}
                  />
                  <Button
                    variant="text"
                    onClick={() => setShowForgotPassword(true)}
                    sx={{ color: theme.palette.accent.main, textTransform: 'none' }}
                  >
                    Forgot Password?
                  </Button>
                </Box>
              )}
              <StyledButton
                fullWidth
                type="submit"
                size="large"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
              </StyledButton>
              <Typography
                variant="body2"
                sx={{ textAlign: 'center', color: theme.palette.gray.main }}
              >
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <Button
                  variant="text"
                  onClick={() => setIsLogin(!isLogin)}
                  sx={{ color: theme.palette.accent.main, textTransform: 'none' }}
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </Button>
              </Typography>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: theme.palette.gray.main, mb: 2 }}>
                  Or continue with
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <SocialButton onClick={() => handleSocialLogin('google')}>
                    <GoogleIcon />
                  </SocialButton>
                  <SocialButton onClick={() => handleSocialLogin('facebook')}>
                    <FacebookIcon />
                  </SocialButton>
                  <SocialButton onClick={() => handleSocialLogin('github')}>
                    <GitHubIcon />
                  </SocialButton>
                </Box>
              </Box>
            </Box>
          </form>
        </StyledPaper>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onClose={() => setShowForgotPassword(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {resetSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Password reset instructions have been sent to your email.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForgotPassword(false)}>
            {resetSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!resetSuccess && (
            <Button
              onClick={handleForgotPassword}
              disabled={loading || !resetEmail}
              variant="contained"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Auth; 