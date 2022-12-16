const express = require('express');
const { append } = require('express/lib/response');
const process = require('process');

require('./routes')(app);


port = process.env.PORT;


app.listen(port, (req, res)=>{

});
