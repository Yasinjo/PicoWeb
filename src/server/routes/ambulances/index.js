/*
  * @file-description : this file exports the router to use with /api/ambulances/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const path = require('path');
const passport = require('passport');

const verifyRequiredFields = require('../../helpers/verifyRequiredFields');
const {
  saveAmbulance, getAmbulancesByPartner, updateAmbulance, deleteAmbulance, AMBULANCES_REPO_NAME
} = require('./helpers/index');
const { uploadMiddleware, UPLOADS_PATH } = require('../../helpers/uploadPictureHelper');
const { PARTNER_AUTH_STRATEGY_NAME } = require('../partners/index');

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
router.post('/', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }),
  uploadMiddleware.single('image'), (request, response) => {
  // Initialize the required keys
    const requiredKeys = ['registration_number', 'hospital_ids'];
    // Verify the required fields and save the ambulance
    verifyRequiredFields(request, response, requiredKeys)
      .then(() => {
        saveAmbulance(request, response, requiredKeys);
      });
  });

/*
    * @route : GET /api/ambulances
    * @description : get all the ambulances added by a partner
*/
router.get('/', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => getAmbulancesByPartner(request, response));

/*
    * @route : PATCH /api/ambulances/:ambulance_id
    * @description : update the data of an ambulance
*/
router.patch('/:ambulance_id', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }), uploadMiddleware.single('image'),
  (request, response) => {
    // Initialize the required keys
    const requiredKeys = ['registration_number', 'hospital_ids'];
    // Verify the required fields and save the ambulance
    verifyRequiredFields(request, response, requiredKeys)
      .then(() => {
        updateAmbulance(request, response, request.params.ambulance_id, requiredKeys);
      });
  });


/*
    * @route : DELETE /api/ambulances/:ambulance_id
    * @description : delete a hospital
*/
router.delete('/:ambulance_id', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => {
    const ambulanceId = request.params.ambulance_id;
    deleteAmbulance(request, response, ambulanceId);
  });

// Image routing
router.use('/image', express.static(path.join(UPLOADS_PATH, AMBULANCES_REPO_NAME)));

// Export the module
module.exports = {
  router,
  AMBULANCES_REPO_NAME
};
