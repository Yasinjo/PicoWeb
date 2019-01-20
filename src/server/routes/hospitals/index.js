/*
  * @file-description : this file exports the router to use with /api/hospitals/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');

const hospitalsCitizensRouter = require('./citizens/index');
const hospitalsDriversRouter = require('./drivers/index');
const hospitalsPartnersRouter = require('./partners/index');

// Create the router
const router = express.Router();

// seprate routes (for different uthentication strategies)
router.use('/citizens', hospitalsCitizensRouter.router);
router.use('/drivers', hospitalsDriversRouter.router);
router.use('/partners', hospitalsPartnersRouter.router);

// Export the module
module.exports = {
  router
};
