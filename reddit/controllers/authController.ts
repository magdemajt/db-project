import express from 'express';
import asyncWrapper from 'common/asyncWrapper';
import db from 'dbConnection';
import User from 'models/User';
import auth from 'middleware/auth';


interface IUserRepository {
  getUserByEmail(email: string): Promise<User | undefined>;

  saveUser(user: User): Promise<void>;
}

const UserRepository: IUserRepository = {
  getUserByEmail: async (email: string) => {
    const user = await db.query(
      `SELECT id, name, email, passwordhash
       FROM users
       WHERE email = $1`,
      [email],
    );
    if (user.rows.length === 0) {
      return undefined;
    }
    return User.fromJson(user.rows[0]);
  },
  async saveUser(user: User): Promise<void> {
    await db.query(
      `INSERT INTO Users(email, passwordHash, name)
       VALUES ($1, $2, $3)`,
      [user.email, user.passwordHash, user.nickname],
    );
  },
}

const authController = express.Router();

authController.post('/login', asyncWrapper(async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({
      message: 'Email and password are required',
    });
    return;
  }

  const user = await UserRepository.getUserByEmail(req.body.email);

  if (!user) {
    res.status(401).json({
      message: 'Invalid email or password',
    });
    return;
  }

  const isSame = user.comparePasswordHash(req.body.password);
  if (!isSame) {
    res.status(401).json({
      message: 'Invalid email or password',
    });
    return;
  }
  await new Promise((resolve) => req.session.regenerate(resolve));
  req.session.user = user;
  await new Promise((resolve) => req.session.save(resolve));

  res.status(200).json({
    nickname: user.nickname,
  });
}));

authController.post('/logout', auth, asyncWrapper(async (req, res) => {
  await new Promise((resolve) => req.session.destroy(resolve));
  res.status(200).json({
    message: 'Logged out',
  });
}));

authController.get('/me', auth, asyncWrapper(async (req, res) => {
  res.status(200).json({
    nickname: req.session.user!.nickname,
  });
}));

authController.post('/register', asyncWrapper(async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({
      message: 'Email and password are required',
    });
    return;
  }

  const user = await UserRepository.getUserByEmail(req.body.email);
  if (user) {
    res.status(400).json({
      message: 'Email already exists',
    });
    return;
  }


  const newUser = new User('1', req.body.name, req.body.email, await User.generatePasswordHash(req.body.password));
  await UserRepository.saveUser(newUser);

  req.session.user = newUser;
  await new Promise((resolve) => req.session.save(resolve));

  res.status(200).json({
    name: newUser.nickname,
  });
}));

export default authController;

