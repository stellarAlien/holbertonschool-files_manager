import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = express.Router();

router.get('/', AppController.index);
router.post('/users', UsersController.create);

export default router;
