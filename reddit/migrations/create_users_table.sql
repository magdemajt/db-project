CREATE TABLE IF NOT EXISTS Users (
  id serial primary key,
  name text,
  email text,
  passwordHash TEXT,
  unique (email),
  created_at timestamp default now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_index ON Users (email);
