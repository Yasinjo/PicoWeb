/*
  * @file-description : this file is the index file of the API
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const citizensRoutes = require('./routes/citizens/index');
const hospitalsRoutes = require('./routes/hospitals/index');
const config = require('../../config/database');

// Create the express app
const app = express();
// Initialize the API port
const PORT = (process.env.PORT) ? process.env.PORT : 9090;

// Create the API router
const apiRouter = express.Router();

// Add promise to mongoose
mongoose.Promise = Promise;

// Initialize routers
apiRouter.use('/citizens', citizensRoutes.router);
apiRouter.use('/hospitals', hospitalsRoutes.router);

// Use plugins to parse the request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Initialize the API entering point
app.use('/api', apiRouter);

// Add the authentication module
app.use(passport.initialize());

// Add a linstener on mongoose connection
mongoose.connection.on('connected', () => {
  // Listen to a specific port
  app.listen(PORT, () => console.log('Listening on port 8080!'));
});


// Connect mongoose to database
mongoose.connect(config.database, { useNewUrlParser: true });
