const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const citizensRoutes = require('./routes/citizens/index');
const hospitalsRoutes = require('./routes/hospitals/index');
const config = require('../../config/database');

const app = express();

const apiRouter = express.Router();
// Promise = require('bluebird');
mongoose.Promise = Promise;
apiRouter.use('/citizens', citizensRoutes);
apiRouter.use('/hospitals', hospitalsRoutes);

app.use(express.static('dist'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRouter);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(passport.initialize());

mongoose.connect(config.database, { useNewUrlParser: true });

app.listen(8080, () => console.log('Listening on port 8080!'));
