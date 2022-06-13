import React from 'react';
import { Box, ThemeProvider } from '@mui/material';
import { theme } from 'theme';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Navbar from 'layout/navbar';
import { QueryClient, QueryClientProvider } from 'react-query';
import LoginPage from 'views/login/LoginPage';
import AuthContextProvider from 'contexts/AuthContext';
import RegisterPage from 'views/register/RegisterPage';
import GroupsPage from 'views/groups/GroupsPage';
import HomePage from 'views/home/HomePage';
import PostPage from 'views/posts/PostPage';
import GroupPosts from 'views/posts/GroupPosts';

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
                <Route path="/home" element={<HomePage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/groups" element={<GroupsPage/>}/>
                <Route path="/post/:value/:id_posts/:personalValue/:id_users/:name/:title/:post_content/:created_at" element={<PostPage />}/>
                <Route path="/groupPosts/:is_participant/:id_group" element={ <GroupPosts /> }/>
              </Routes>
            </Box>
          </ThemeProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
