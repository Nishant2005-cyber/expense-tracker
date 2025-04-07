import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
}

interface UpdateTransactionProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onUpdate: (updatedTransaction: Transaction) => Promise<void>;
}

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

const UpdateTransaction: React.FC<UpdateTransactionProps> = ({
  open,
  onClose,
  transaction,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!transaction) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const updatedTransaction = {
        ...transaction,
        type: formData.get('type') as 'income' | 'expense',
        amount: parseFloat(formData.get('amount') as string),
        category: formData.get('category') as string,
        date: formData.get('date') as string,
        description: formData.get('description') as string,
      };

      await onUpdate(updatedTransaction);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: 'dark.main',
          backgroundImage: 'none',
        }
      }}
    >
      <DialogTitle sx={{ color: 'light.main' }}>Update Transaction</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: { xs: '300px', sm: '400px' },
            mt: 2,
          }}
        >
          <TextField
            select
            label="Type"
            name="type"
            defaultValue={transaction.type}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'light.main',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'gray.main',
              },
              '& .MuiSelect-icon': {
                color: 'light.main',
              },
            }}
          >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>

          <TextField
            label="Amount"
            name="amount"
            type="number"
            defaultValue={transaction.amount}
            required
            inputProps={{ min: 0, step: 0.01 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'light.main',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'gray.main',
              },
            }}
          />

          <TextField
            select
            label="Category"
            name="category"
            defaultValue={transaction.category}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'light.main',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'gray.main',
              },
              '& .MuiSelect-icon': {
                color: 'light.main',
              },
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date"
            name="date"
            type="date"
            defaultValue={transaction.date}
            required
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'light.main',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'gray.main',
              },
            }}
          />

          <TextField
            label="Description"
            name="description"
            defaultValue={transaction.description}
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'light.main',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'gray.main',
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button 
              onClick={onClose} 
              disabled={loading}
              sx={{ color: 'light.main' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Update
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTransaction;
