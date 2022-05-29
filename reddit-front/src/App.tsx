import React from 'react';
import { Box, ThemeProvider } from '@mui/material';
import { theme } from 'theme';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Navbar from 'layout/navbar';
import { QueryClient, QueryClientProvider } from 'react-query';
import LoginPage from 'views/login/LoginPage';
import AuthContextProvider from 'contexts/AuthContext';
import RegisterPage from 'views/register/RegisterPage';

const queryClient = new QueryClient();


function App() {


  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <ThemeProvider theme={theme}>
            <Box>
              <Navbar/>
              <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
              </Routes>
            </Box>
          </ThemeProvider>
        </AuthContextProvider>

      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
