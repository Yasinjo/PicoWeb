/*
  * @file-description : this file exports the router to use with /api/hospitals/partners/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const passport = require('passport');
const verifyRequiredFields = require('../../../helpers/verifyRequiredFields');
const GenericDAO = require('../../../dao/genericDAO');
const { getAllHospitalsByPartner, updateHospital } = require('../helpers/index');
const { saveHospital } = require('../helpers/index');
const { PARTNER_AUTH_STRATEGY_NAME } = require('../../partners/index');
const Hospital = require('../../../bo/hospital.bo');

// Create the router
const router = express.Router();

/*
    * @route : POST /api/hospitals
    * @description : add a hospital
    * @Request headers :
      Authorization : token(string)
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
router.post('/', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }), (request, response) => {
  // Initialize the required keys
  const dataKeys = ['name', 'latitude', 'longitude'];
  // Verify the required fields and save the hospital
  verifyRequiredFields(request, response, dataKeys)
    .then(() => {
      saveHospital(request, response, dataKeys);
    });
});

/*
    * @route : GET /api/hospitals/partners
    * @description : get all the hospitals added by a partner
*/
router.get('/', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => getAllHospitalsByPartner(request, response));


/*
    * @route : PATCH /api/hospitals/partners/:hospital_id
    * @description : update the data of a hospital
*/
router.patch('/:hospital_id', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => {
    // Initialize the required keys
    const requiredKeys = ['name', 'latitude', 'longitude'];
    // Verify the required fields and save the ambulance
    verifyRequiredFields(request, response, requiredKeys)
      .then(() => {
        updateHospital(request, response, request.params.hospital_id, requiredKeys);
      });
  });

/*
    * @route : DELETE /api/hospitals/partners/:hospital_id
    * @description : delete a hospital
*/
router.delete('/:hospital_id', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => {
    GenericDAO.remove(Hospital, { _id: request.params.hospital_id })
      .then(response.status(200).send())
      .catch((err) => {
        console.log('DELETE /api/hospitals/partners/:hospital_id error :');
        console.log(err);
        response.status(400).send();
      });
  });

// Export the module
module.exports = {
  router
};
