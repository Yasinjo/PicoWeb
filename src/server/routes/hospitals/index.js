/*
  * @file-description : this file exports the router to use with /api/hospitals/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const hospitalsCitizensRouter = require('./citizens/index');

// Create the router
const router = express.Router();

// seprate routes (for different uthentication strategies)
router.use('/citizens', hospitalsCitizensRouter.router);

// Export the module
module.exports = {
  router
};
