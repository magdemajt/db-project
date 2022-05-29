import React from 'react';
import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material';
import FormTextField from 'components/FormTextField';
import { useForm, FormProvider } from 'react-hook-form';
import { generateRequestConfig, generateURL } from 'config';
import { NavLink, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const methods = useForm<{ email: string; password: string; }>();

  const navigate = useNavigate();

  const onSubmit = async (data: { email: string; password: string; }) => {
    await fetch(generateURL('/auth/login'), generateRequestConfig({
      method: 'POST',
      body: JSON.stringify(data),
    }));
    navigate('/home');
  };

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Sign in"/>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormTextField label="Email" name="email" type="email" rules={{
                    pattern: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                    required: true,
                  }} />
                </Grid>
                <Grid item xs={12}>
                  <FormTextField label="Password" name="password" type="password" rules={{
                    minLength: 6,
                    required: true,
                  }} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary" fullWidth onClick={handleSubmit(onSubmit)}>
                    Sign in
                  </Button>
                  <Button variant="text" type="button" fullWidth component={NavLink} to="/register">
                    Register
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
