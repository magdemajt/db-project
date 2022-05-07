import express from 'express';
import asyncWrapper from 'common/asyncWrapper';
import db from 'dbConnection';
import User from 'models/User';


interface IUserRepository {
  getUserByEmail(email: string): Promise<User | undefined>;
  saveUser(user: User): Promise<void>;
}

const UserRepository: IUserRepository = {
  getUserByEmail: async (email: string) => {
    const user = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return User.fromJson(user.rows[0]);
  },
  async saveUser(user: User): Promise<void> {
    await db.query(
      `INSERT INTO users (email, passwordHash, nickname) VALUES ($1, $2, $3)`,
      [user.email, user.passwordHash, user.nickname]
    );
  }
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

  const token = user.generateJwtToken();

  res.status(200).json({
    token,
    nickname: user.nickname,
  });
}));

export default authController;

