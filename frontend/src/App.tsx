import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import AddExpense from './pages/AddExpense';
import Report from './pages/Report';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/reports" element={<Report />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
