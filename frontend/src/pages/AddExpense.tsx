import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Avatar,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Pagination,
  InputAdornment,
  TableSortLabel,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AddTransaction from '../components/AddTransaction';
import UpdateTransaction from '../components/UpdateTransaction';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
}

interface SortConfig {
  field: keyof Transaction;
  direction: 'asc' | 'desc';
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: theme.palette.light.main,
}));

const ITEMS_PER_PAGE = 10;
const CATEGORIES = [
  'All',
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

const AddExpense: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // New state for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', direction: 'desc' });
  const [dateRange, setDateRange] = useState({
    start: '',
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedCategory, dateRange]);

  const loadTransactions = () => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      setTransactions(parsedTransactions);
    }
  };

  // Filter and sort transactions
  const filteredAndSortedTransactions = React.useMemo(() => {
    return transactions
      .filter((transaction) => {
        const matchesSearch = 
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = 
          selectedType === 'all' || transaction.type === selectedType;
        
        const matchesCategory =
          selectedCategory === 'All' || transaction.category === selectedCategory;

        const transactionDate = new Date(transaction.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
        const matchesDate = 
          transactionDate >= startDate && transactionDate <= endDate;

        return matchesSearch && matchesType && matchesCategory && matchesDate;
      })
      .sort((a, b) => {
        const { field, direction } = sortConfig;
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [transactions, searchTerm, selectedType, selectedCategory, dateRange, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: keyof Transaction) => {
    setSortConfig((prevConfig) => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      const storedTransactions = localStorage.getItem('transactions');
      const allTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      const transactionWithId = {
        ...newTransaction,
        id: crypto.randomUUID()
      };
      const updatedTransactions = [...allTransactions, transactionWithId];
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      loadTransactions();
      setShowAddTransaction(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
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
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      const allTransactions = JSON.parse(storedTransactions);
      const updatedTransactions = allTransactions.map((t: Transaction) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      );
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    }

    loadTransactions();
    setIsUpdateDialogOpen(false);
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

  return (
    <Box sx={{ p: 3, backgroundColor: 'dark.main', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" color="light.main" mb={3}>
          Transactions
        </Typography>

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
                  sx={{ color: 'light.main' }}
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
          <Box>
            <Stack direction="row" spacing={2} mb={3} alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowAddTransaction(true)}
              >
                Add New Transaction
              </Button>

              <TextField
                size="small"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'gray.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'light.main',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  },
                }}
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'gray.main' }}>Type</InputLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
                  label="Type"
                  sx={{
                    color: 'light.main',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'gray.main' }}>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                  sx={{
                    color: 'light.main',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                type="date"
                label="From"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'light.main',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  },
                  '& .MuiInputLabel-root': { color: 'gray.main' },
                }}
              />

              <TextField
                size="small"
                type="date"
                label="To"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'light.main',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  },
                  '& .MuiInputLabel-root': { color: 'gray.main' },
                }}
              />
            </Stack>

            <StyledCard>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="light.main">
                      All Transactions
                    </Typography>
                    <Typography variant="body2" color="gray.main">
                      {filteredAndSortedTransactions.length} transactions found
                    </Typography>
                  </Box>
                }
              />
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              <CardContent>
                {paginatedTransactions.length === 0 ? (
                  <Typography color="gray.main" textAlign="center" py={4}>
                    No transactions found matching your filters.
                  </Typography>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <TableSortLabel
                          active={sortConfig.field === 'date'}
                          direction={sortConfig.field === 'date' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('date')}
                          sx={{ color: 'light.main' }}
                        >
                          Date
                        </TableSortLabel>
                        <TableSortLabel
                          active={sortConfig.field === 'amount'}
                          direction={sortConfig.field === 'amount' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('amount')}
                          sx={{ color: 'light.main' }}
                        >
                          Amount
                        </TableSortLabel>
                      </Box>
                    </Box>

                    {paginatedTransactions.map((transaction) => (
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

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        color="primary"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            color: 'light.main',
                          },
                        }}
                      />
                    </Box>
                  </>
                )}
              </CardContent>
            </StyledCard>
          </Box>
        )}
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

export default AddExpense; 