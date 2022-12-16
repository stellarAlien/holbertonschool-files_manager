const express = require('express');

import AppController from '../controllers/AppController';

import UserController from '../controllers/UsersController';

app = new express();

const router = express.Router();

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStats);

router.post('/users', UserController.postNew);