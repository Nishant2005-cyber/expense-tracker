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
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  TrendingDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const drawerWidth = 240;

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
    color: theme.palette.light.main,
  },
}));

const Report: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' }>({
    key: 'amount',
    direction: 'desc',
  });
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      const expenses = parsedTransactions.filter((t: Transaction) => t.type === 'expense');
      setTransactions(expenses);
    }
  };

  // Merge sort implementation for sorting expenses
  const mergeSort = (arr: Transaction[], key: keyof Transaction, direction: 'asc' | 'desc'): Transaction[] => {
    if (arr.length <= 1) return arr;

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    return merge(
      mergeSort(left, key, direction),
      mergeSort(right, key, direction),
      key,
      direction
    );
  };

  const merge = (
    left: Transaction[],
    right: Transaction[],
    key: keyof Transaction,
    direction: 'asc' | 'desc'
  ): Transaction[] => {
    let result: Transaction[] = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      const leftValue = left[leftIndex][key];
      const rightValue = right[rightIndex][key];
      const comparison = direction === 'asc' ? leftValue < rightValue : leftValue > rightValue;

      if (comparison) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  };

  // Binary search implementation
  const binarySearch = (arr: Transaction[], query: string): Transaction[] => {
    if (!query.trim()) return arr;
    
    const searchFields = ['category', 'description', 'date'];
    const results: Transaction[] = [];
    
    // First, sort the array by each field to enable binary search
    for (const field of searchFields) {
      const sortedArray = [...arr].sort((a, b) => 
        a[field as keyof Transaction].toString().localeCompare(b[field as keyof Transaction].toString())
      );
      
      let left = 0;
      let right = sortedArray.length - 1;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const value = sortedArray[mid][field as keyof Transaction].toString().toLowerCase();
        const searchValue = query.toLowerCase();
        
        if (value.includes(searchValue)) {
          // Found a match, now check adjacent elements
          let i = mid;
          while (i >= 0 && sortedArray[i][field as keyof Transaction].toString().toLowerCase().includes(searchValue)) {
            if (!results.some(r => r.id === sortedArray[i].id)) {
              results.push(sortedArray[i]);
            }
            i--;
          }
          
          i = mid + 1;
          while (i < sortedArray.length && sortedArray[i][field as keyof Transaction].toString().toLowerCase().includes(searchValue)) {
            if (!results.some(r => r.id === sortedArray[i].id)) {
              results.push(sortedArray[i]);
            }
            i++;
          }
          break;
        } else if (value < searchValue) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
    }

    return results;
  };

  const handleSort = (key: keyof Transaction) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc',
    });
  };

  const sortedTransactions = mergeSort(transactions, sortConfig.key, sortConfig.direction);
  const filteredTransactions = searchQuery
    ? binarySearch(sortedTransactions, searchQuery)
    : sortedTransactions;

  // Prepare data for the chart
  const chartData = React.useMemo(() => {
    // Group expenses by category and calculate total amount
    const categoryTotals = transactions.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by amount in decreasing order
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category,
        amount: amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Add Expense', icon: <AddIcon />, path: '/add-expense' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/report' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `100%` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'dark.secondary',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Expense Reports
          </Typography>
        </Toolbar>
      </AppBar>


      {/* <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
            backgroundColor: 'dark.main',
            color: 'light.main',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
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
        </List>
      </Drawer> */}

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, backgroundColor: 'dark.main' }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <StyledCard>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                    <TrendingDown />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" color="light.main">
                    Category-wise Expenses
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="gray.main">
                    Total expenses grouped by category in decreasing order
                  </Typography>
                }
              />
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              <CardContent sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255, 255, 255, 0.7)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
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
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Amount']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke={theme.palette.error.main}
                      strokeWidth={2}
                      dot={{ fill: theme.palette.error.main }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </StyledCard>

            <StyledCard sx={{ mt: 3 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                    <SearchIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" color="light.main">
                    Expense Search
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="gray.main">
                    Search through your expenses
                  </Typography>
                }
              />
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              <CardContent>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'light.main',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    },
                  }}
                />
              </CardContent>
            </StyledCard>

            <StyledCard sx={{ mt: 3 }}>
              <CardHeader
                title={
                  <Typography variant="h6" color="light.main">
                    Expense Details
                  </Typography>
                }
              />
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'date'}
                          direction={sortConfig.key === 'date' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('date')}
                        >
                          Date
                        </TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'category'}
                          direction={sortConfig.key === 'category' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('category')}
                        >
                          Category
                        </TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'amount'}
                          direction={sortConfig.key === 'amount' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('amount')}
                        >
                          Amount
                        </TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell>Description</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id}
                        sx={{ 
                          '&:nth-of-type(odd)': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                        }}
                      >
                        <TableCell sx={{ color: 'light.main' }}>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ color: 'light.main' }}>{transaction.category}</TableCell>
                        <TableCell sx={{ color: theme.palette.error.main }}>
                          ${transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ color: 'light.main' }}>{transaction.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </StyledCard>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Report; 