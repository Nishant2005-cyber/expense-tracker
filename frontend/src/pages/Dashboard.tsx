import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  ListItemButton,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Button,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import UpdateTransaction from '../components/UpdateTransaction';
import AddTransaction from '../components/AddTransaction';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { logout } from '../services/auth';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface CategoryBreakdownItem {
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface MonthlyTrendItem {
  month: string;
  amount: number;
  category: string;
  description: string;
}

interface ChartDataItem {
  date: string;
  income: number;
  expense: number;
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: theme.palette.light.main,
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: theme.palette.light.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  height: '100%',
}));

const Dashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const categories = [
    'Salary',
    'Freelance',
    'Investments',
    'Food',
    'Transportation',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Other',
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    if (!token || !user) {
      navigate('/auth');
      return;
    }
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      setTransactions(parsedTransactions);
      
      const income = parsedTransactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);
      
      const expense = parsedTransactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);
      
      setTotalIncome(income);
      setTotalExpense(expense);
    }
  };

  const handleUpdateClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateClose = () => {
    setIsUpdateDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    // Update in localStorage
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      const allTransactions = JSON.parse(storedTransactions);
      const updatedTransactions = allTransactions.map((t: Transaction) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      );
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    }

    // Refresh the dashboard
    loadTransactions();
  };

  const handleAddTransaction = async (newTransaction: Transaction) => {
    try {
      const storedTransactions = localStorage.getItem('transactions');
      const allTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      const updatedTransactions = [...allTransactions, newTransaction];
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      // Refresh the dashboard
      loadTransactions();
      setShowAddTransaction(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (confirmed) {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        const allTransactions = JSON.parse(storedTransactions);
        const updatedTransactions = allTransactions.filter((t: Transaction) => t.id !== transactionId);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        loadTransactions();
      }
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Add Expense', icon: <AddIcon />, path: '/add-expense' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.accent.main} 0%, ${theme.palette.primary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}
        >
          EXPENSIOO
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'light.main' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => navigate('/')}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'light.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  // Prepare data for the chart
  const chartData = React.useMemo<ChartDataItem[]>(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => t.date === date);
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        income,
        expense,
      };
    });
  }, [transactions]);

  // Calculate category breakdown
  const categoryBreakdown = React.useMemo<CategoryBreakdownItem[]>(() => {
    const expenses = transactions.filter((t: Transaction) => t.type === 'expense');
    // Sort expenses by amount in descending order
    const sortedExpenses = [...expenses].sort((a: Transaction, b: Transaction) => b.amount - a.amount);
    
    return sortedExpenses.map((expense: Transaction) => ({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: expense.date
    }));
  }, [transactions]);

  // Calculate monthly spending trend
  const monthlyTrend = React.useMemo<MonthlyTrendItem[]>(() => {
    const expenses = transactions.filter((t: Transaction) => t.type === 'expense');
    // Sort expenses by date
    const sortedExpenses = [...expenses].sort((a: Transaction, b: Transaction) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedExpenses.map((expense: Transaction) => ({
      month: new Date(expense.date).toLocaleString('default', { month: 'short' }),
      amount: expense.amount,
      category: expense.category,
      description: expense.description
    }));
  }, [transactions]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'dark.secondary',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'dark.main',
              color: 'light.main',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'dark.main',
              color: 'light.main',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: 'dark.main',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left side - Stats, Chart, and Analysis */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
              <Box>
            <StatCard>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <AccountBalance />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="gray.main">Balance</Typography>
                <Typography variant="h6">${(totalIncome - totalExpense).toFixed(2)}</Typography>
              </Box>
            </StatCard>
              </Box>
              <Box>
            <StatCard>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="gray.main">Income</Typography>
                <Typography variant="h6">${totalIncome.toFixed(2)}</Typography>
              </Box>
            </StatCard>
              </Box>
              <Box>
            <StatCard>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <TrendingDown />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="gray.main">Expenses</Typography>
                <Typography variant="h6">${totalExpense.toFixed(2)}</Typography>
              </Box>
            </StatCard>
              </Box>
            </Box>

            {/* Chart */}
            <Box sx={{ mt: 3 }}>
              <StyledCard>
                <CardHeader
                  title={
                    <Typography variant="h6" color="light.main">
                      Weekly Overview
                    </Typography>
                  }
                />
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <CardContent sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255, 255, 255, 0.7)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.7)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'dark.main',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'light.main'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#4caf50" 
                        strokeWidth={2}
                        dot={{ fill: '#4caf50' }}
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expense" 
                        stroke="#f44336" 
                        strokeWidth={2}
                        dot={{ fill: '#f44336' }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Box>

            {/* Analysis Section */}
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Top Row - Category Breakdown and Monthly Trend */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* Category Breakdown */}
                <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '45%' } }}>
                  <StyledCard sx={{ height: '100%' }}>
                    <CardHeader
                      title={
                        <Typography variant="h6" color="light.main">
                          Category Breakdown
                        </Typography>
                      }
                      subheader={
                        <Typography variant="body2" color="gray.main">
                          Distribution of expenses across different categories
                        </Typography>
                      }
                    />
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <CardContent sx={{ height: 'calc(100% - 120px)', overflow: 'auto' }}>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryBreakdown}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="amount"
                              label={({ category, amount }) => `${category} $${amount.toFixed(2)}`}
                            >
                              {categoryBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'dark.main',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'light.main'
                              }}
                              formatter={(value: number, name: string, props: any) => [
                                `$${value.toFixed(2)}`,
                                `${props.payload.description || props.payload.category}`
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        {categoryBreakdown.map((item, index) => (
                          <Box key={`${item.category}-${index}`} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" color="light.main">
                                {item.category}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="light.main">
                                  ${item.amount.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="gray.main">
                                  {new Date(item.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(item.amount / Math.max(...categoryBreakdown.map(i => i.amount))) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: COLORS[index % COLORS.length],
                                },
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Box>

                {/* Monthly Spending Trend */}
                <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '45%' } }}>
                  <StyledCard sx={{ height: '100%' }}>
                    <CardHeader
                      title={
                        <Typography variant="h6" color="light.main">
                          Monthly Spending Trend
                        </Typography>
                      }
                      subheader={
                        <Typography variant="body2" color="gray.main">
                          Track your spending patterns over time
                        </Typography>
                      }
                    />
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <CardContent sx={{ height: 'calc(100% - 120px)', overflow: 'auto' }}>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis 
                              dataKey="month" 
                              stroke="rgba(255, 255, 255, 0.7)"
                              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                            />
                            <YAxis 
                              stroke="rgba(255, 255, 255, 0.7)"
                              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'dark.main',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'light.main'
                              }}
                              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                            />
                            <Bar dataKey="amount" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                          <Grid container spacing={2}>
                            <Box sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                              <Typography variant="body2" color="gray.main">Highest Spending</Typography>
                              <Typography variant="h6" color="light.main">
                                ${Math.max(...monthlyTrend.map(item => item.amount)).toFixed(2)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid container spacing={2}>
                            <Box sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                              <Typography variant="body2" color="gray.main">Average Monthly</Typography>
                              <Typography variant="h6" color="light.main">
                                ${(monthlyTrend.reduce((acc, curr) => acc + curr.amount, 0) / monthlyTrend.length).toFixed(2)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Box>
              </Box>

              {/* Bottom Row - Spending Insights */}
              <Box>
                <StyledCard sx={{ height: '100%' }}>
                  <CardHeader
                    title={
                      <Typography variant="h6" color="light.main">
                        Spending Insights
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body2" color="gray.main">
                        Key metrics and recommendations
                      </Typography>
                    }
                  />
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <CardContent sx={{ height: 'calc(100% - 120px)', overflow: 'auto' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ 
                        flex: 1, 
                        minWidth: { xs: '100%', sm: '45%' },
                        p: 2, 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2" color="gray.main">Savings Rate</Typography>
                        <Typography variant="h6" color="light.main">
                          {totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%
                        </Typography>
                        <Typography variant="caption" color="gray.main">
                          {totalIncome > 0 && ((totalIncome - totalExpense) / totalIncome * 100) < 20 
                            ? "Consider increasing your savings rate" 
                            : "Good savings rate"}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        flex: 1, 
                        minWidth: { xs: '100%', sm: '45%' },
                        p: 2, 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2" color="gray.main">Largest Category</Typography>
                        <Typography variant="h6" color="light.main">
                          {categoryBreakdown[0]?.category || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="gray.main">
                          ${categoryBreakdown[0]?.amount.toFixed(2) || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        flex: 1, 
                        minWidth: { xs: '100%', sm: '45%' },
                        p: 2, 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2" color="gray.main">Expense to Income Ratio</Typography>
                        <Typography variant="h6" color="light.main">
                          {totalIncome > 0 ? (totalExpense / totalIncome * 100).toFixed(1) : 0}%
                        </Typography>
                        <Typography variant="caption" color="gray.main">
                          {totalIncome > 0 && (totalExpense / totalIncome) > 0.8 
                            ? "Consider reducing expenses" 
                            : "Healthy ratio"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Box>
            </Box>
          </Box>

          {/* Right side - Recent Transactions or Add Transaction Form */}
          <Box sx={{ 
            width: { xs: '100%', md: '400px' },
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            {showAddTransaction ? (
              <StyledCard>
                <CardHeader
                  title={
                    <Typography variant="h6" color="light.main">
                      Add New Transaction
                    </Typography>
                  }
                  action={
                    <Button
                      onClick={() => setShowAddTransaction(false)}
                      sx={{ color: theme.palette.light.main }}
                    >
                      Cancel
                    </Button>
                  }
                />
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <CardContent>
                  <AddTransaction onSubmit={handleAddTransaction} />
                </CardContent>
              </StyledCard>
            ) : (
            <StyledCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title={
                  <Typography variant="h6" color="light.main">
                    Recent Transactions
                  </Typography>
                }
                action={
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddTransaction(true)}
                    sx={{ color: theme.palette.light.main }}
                  >
                    Add New
                  </Button>
                }
              />
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              <CardContent
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                {transactions.length === 0 ? (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Typography color="gray.main" textAlign="center">
                      No transactions yet. Click "Add New" to get started.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ flex: 1 }}>
                      {transactions.slice(-6, -1).map((transaction) => (
                        <Box
                          key={transaction.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                            p: 2,
                            borderRadius: 1,
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            },
                          }}
                        >
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              flex: 1,
                              cursor: 'pointer',
                            }}
                            onClick={() => handleUpdateClick(transaction)}
                          >
                            <Avatar
                              sx={{
                                bgcolor: transaction.type === 'income' ? 'success.main' : 'error.main',
                              }}
                            >
                              {transaction.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{transaction.category}</Typography>
                              <Typography variant="caption" color="gray.main">
                                {transaction.description}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography
                                variant="subtitle2"
                                color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                              >
                                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                              </Typography>
                              <Typography variant="caption" color="gray.main">
                                {new Date(transaction.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTransaction(transaction.id);
                              }}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mt: 'auto',
                      pt: 2
                    }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/add-expense')}
                        sx={{
                          color: theme.palette.light.main,
                          borderColor: theme.palette.light.main,
                          '&:hover': {
                            borderColor: theme.palette.light.main,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          },
                        }}
                      >
                        See More Expenses
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </StyledCard>
            )}
          </Box>
        </Box>
      </Box>

      <UpdateTransaction
        open={isUpdateDialogOpen}
        onClose={handleUpdateClose}
        transaction={selectedTransaction}
        onUpdate={handleUpdateTransaction}
      />
    </Box>
  );
};

export default Dashboard; 
