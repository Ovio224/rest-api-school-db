'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const jsonParser = require('body-parser').json;
// const cors = require('cors');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup dependencies
app.use(morgan('dev'));
app.use(jsonParser());


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next()
});


// link to database // fix deprecation error
const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb://localhost:27017/fsjstd-restapi", {
  useNewUrlParser: true
});
const db = mongoose.connection;

db.on('error', (error) => {
  console.log('An error occured on the db, ' + error);
});

db.once('open', () => {
  console.log('Database - Connection successful');
});


// api route
const routes = require('./routes/api');
app.use('/api', routes);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to my REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});