import React, { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { generateRequestConfig, generateURL } from 'config';
import { useNavigate } from 'react-router-dom';

import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material';
import FormTextField from 'components/FormTextField';
import { FormProvider } from 'react-hook-form';

export default function GroupsPage() {
  const methods = useForm<{ name: string; groupId: number }>();

  const [hasError, setErrors] = useState(false);
  const [planets, setPlanets] = useState([]);

  async function fetchData() {
    console.log('fetching');
    const res = await fetch(generateURL('/groups'), generateRequestConfig({
      method: 'GET'
    }));

    res
      .json()
      .then(res => {
        console.log(res);
        setPlanets(res.groups);
      })
      .catch(err => setErrors(err));
  }

  useEffect(() => {
    fetchData();
  }, []);

  const navigate = useNavigate();

  const onSubmit = async (data: { name: string; }) => {
    await fetch(generateURL('/groups/register'), generateRequestConfig({
      method: 'POST',
      body: JSON.stringify(data)
    }));
  };

  const onEnter = async (groupId: number) => {
    const data = {groupId : groupId};
    await fetch(generateURL('/groups/enter'), generateRequestConfig({
      method: 'POST',
      body: JSON.stringify(data)
    }));
    await fetchData();
  };

  const onDeEnter = async (groupId: number) => {
    const data = {groupId : groupId};
    await fetch(generateURL('/groups/deenter'), generateRequestConfig({
      method: 'POST',
      body: JSON.stringify(data)
    }));
    await fetchData();
  };

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Nowa grupę"/>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormTextField label="Nazwa" name="name" type="text"/>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary" fullWidth onClick={handleSubmit(onSubmit)}>
                    Utwórz grupę
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card>
          <div>
          {
            planets.map((item: any, key: any) => (
              <li className="list-group-item" key={key} value={item.id}>
                {item.name} {item.name} {item.id} {item.belongs ? 
                 <button name="groupId" value={item.id} onClick={_ => onDeEnter(item.id)}>wypisz sie</button> :
                 <button name="groupId" value={item.id} onClick={_ => onEnter(item.id)}>dopisz sie</button>}
              </li>
            ))
          }
          </div>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
