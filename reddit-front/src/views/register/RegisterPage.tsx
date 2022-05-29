import React from 'react';
import { Button, Card, CardContent, CardHeader, Grid, TextField } from '@mui/material';
import FormTextField from 'components/FormTextField';
import { useForm, FormProvider } from 'react-hook-form';
import { generateRequestConfig, generateURL } from 'config';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const methods = useForm();

  const navigate = useNavigate();

  const { handleSubmit } = methods;

  const onSubmit = async (values: any) => {
    await fetch(generateURL('/auth/register'), generateRequestConfig({
      method: 'POST',
      body: JSON.stringify(values),
    }));
    navigate('/home');
  }

  return (
    <FormProvider {...methods}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Sign up"/>
            <CardContent>
              <Grid container>
                <Grid item xs={12}>
                  <FormTextField label="Username" name="name" type="text" />
                </Grid>
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
                  <FormTextField label="Confirm Password" name="confirmPassword" type="password" rules={{
                    minLength: 6,
                    required: true,
                  }} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary" fullWidth onClick={handleSubmit(onSubmit)}>
                    Sign up
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
