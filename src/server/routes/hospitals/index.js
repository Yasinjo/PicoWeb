/*
  * @file-description : this file exports the router to use with /api/hospitals/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const hospitalsCitizensRouter = require('./citizens/index');
const verifyRequiredFields = require('../../helpers/verifyRequiredFields');
const { saveHospital } = require('./helpers/index');

// Create the router
const router = express.Router();

// seprate routes (for different uthentication strategies)
router.use('/citizens', hospitalsCitizensRouter.router);

/*
    * @route : POST /api/hospitals
    * @description : add a hospital
    * @Request body :
      {
          name : <string>{required},
          latitude : <number>{required},
          longitude : <number>{required}
      }
    * @Response body :
      - 400 :
        { success : <boolean>, msg : <string> }
      - 201 :
        { success : <boolean>, hospital_id : <string> }
*/
router.post('/', (request, response) => {
  // Initialize the required keys
  const dataKeys = ['name', 'latitude', 'longitude'];
  // Verify the required fields and save the hospital
  verifyRequiredFields(request, response, dataKeys)
    .then(() => {
      saveHospital(request, response, dataKeys);
    });
});

// Export the module
module.exports = {
  router
};
