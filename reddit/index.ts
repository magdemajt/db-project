import express from 'express'
import authController from './controllers/authController'

const app = express();

app.use('/auth', authController);

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
