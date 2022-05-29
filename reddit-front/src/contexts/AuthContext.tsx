import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { generateRequestConfig, generateURL } from 'config';
import { CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = React.createContext<{ nickname?: string }>({});


export const useAuth = () => React.useContext(AuthContext);

export default function AuthContextProvider({children}: {children: React.ReactNode}) {
  const location = useLocation();
  const { data, error, isLoading,  } = useQuery(['me', location.pathname], () => fetch(generateURL('/auth/me'), generateRequestConfig({
    method: 'GET',
  })).then(res => res.json()), {
    refetchOnWindowFocus: false,
    retry: false,

  });
  const navigate = useNavigate();

  useEffect(() => {
    if (error && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login');
    }
  }, [error, location.pathname, navigate])

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <AuthContext.Provider value={{ nickname: data?.nickname }}>
      {children}
    </AuthContext.Provider>
  );

}
