const express = require('express');

import {getStatus, getStats} from '../controllers/AppController';
app = new express();

app.get('/status', (req,res)=>{
    getStatus();
});

app.get('/stats', (req, res)=>{
    getStats();
});