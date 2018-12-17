/*
  * @file-description : this file exports the router to use with /api/alarms/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const alarmsCitizensRouter = require('./citizens/index');

// Create the router
const router = express.Router();

// seprate routes (for different authentication strategies)
router.use('/citizens', alarmsCitizensRouter.router);

// Export the module
module.exports = {
  router
};
