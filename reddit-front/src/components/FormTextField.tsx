import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useController, RegisterOptions } from 'react-hook-form';

export interface FormTextFieldProps {
  label: string;
  name: string;
  type: TextFieldProps['type'];
  rules?: RegisterOptions;
}

export default function FormTextField(props: FormTextFieldProps) {

  const { field: { name, ref, value, onChange, onBlur } } = useController({
    name: props.name,
    rules: props.rules || {},
    defaultValue: ''
  });

  return (
    <TextField
      onChange={onChange}
      onBlur={onBlur}
      value={value}
      name={name}
      inputRef={ref}
      label={props.label}
      type={props.type}
      id={props.name}
      variant="outlined"
      fullWidth
    />
  );
}
