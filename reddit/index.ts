import express, { Request } from 'express'
import authController from './controllers/authController'
import groupsController from './controllers/groupsController'
import cors from 'cors'
import session from 'express-session';
import User from 'models/User';

import PgStore from 'connect-pg-simple';
import dbConnection from 'dbConnection';



const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(session({
  secret: 'secret',
  store: new (PgStore(session))({
    createTableIfMissing: true,
    pool: dbConnection,

  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: false,
  },
  resave: false,
  saveUninitialized: false,
}));

app.use(express.json());

app.use('/auth', authController);
app.use('/groups', groupsController);

// Auth middleware
app.use((req: Request & { session: Request['session'] & { user?: User } }, res, next) => {
  if (!req.session.user) {
    return res.status(401).send({
      message: 'You are not authorized',
    });
  }
  req.session.touch();
  next();
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
