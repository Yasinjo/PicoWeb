/*
  * @file-description : this file exports the router to use with /api/ambulances/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const verifyRequiredFields = require('../../helpers/verifyRequiredFields');
const { saveAmbulance } = require('./helpers/index');
const { uploadMiddleware } = require('../../helpers/uploadPictureHelper');

// Create the router
const router = express.Router();

/*
    * @route : POST /api/ambulances
    * @description : add an ambulance
    * @Request body :
      {
        registration_number : <string>{required},
        latitude : <number>{required},
        longitude : <number>{required},
        image : <image_file>{optional},
        hospital_ids : [<string>{required}]
      }
    * @Response body :
      - 400 :
        { success : <boolean>, msg : <string> }
      - 201 :
        { success : <boolean>, ambulance_id : <string> }
*/
router.post('/', uploadMiddleware.single('image'), (request, response) => {
  // Initialize the required keys
  const requiredKeys = ['registration_number', 'latitude', 'longitude', 'hospital_ids'];
  // Verify the required fields and save the ambulance
  verifyRequiredFields(request, response, requiredKeys)
    .then(() => {
      saveAmbulance(request, response, requiredKeys);
    });
});

// Export the module
module.exports = {
  router
};
