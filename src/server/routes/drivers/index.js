/*
  * @file-description : this file exports the router to use with /api/drivers/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const Driver = require('../../bo/driver.bo');
const Ambulance = require('../../bo/ambulance.bo');
const { DRIVER_PHONE_ACCOUNT_TYPE } = require('../../bo/phone_account.bo');
const GenericDAO = require('../../dao/genericDAO');
const verifyRequiredFields = require('../../helpers/verifyRequiredFields');
const { uploadMiddleware } = require('../../helpers/uploadPictureHelper');
const { signupUser, signinUser } = require('../../helpers/genericRoutesHelper');
const { AMBULANCE_NOT_FOUND } = require('../alarms/helpers/index');

const DRIVERS_REPO_NAME = 'DRIVERS_REPO_NAME';
const DRIVER_NOT_FOUND = 'Driver not found';

// Create the router
const router = express.Router();

/*
    * @route : POST /api/drivers/signup
    * @description : make a driver subscription
    * @Request body :
      {
          full_name : <string>{required},
          latitude : <number>{required},
          longitude : <number>{required},
          phone_number : <string>{required},
          password : <string>{required},
          image : <image_file>{optional}, ==> see https://www.learn2crack.com/2014/08/android-upload-image-node-js-server.html
      }
    * @Response body :
      - 400 :
        { success : <boolean>, msg : <string> }
      - 201 :
        { success : <boolean> }
*/
router.post('/signup', uploadMiddleware.single('image'), (request, response) => {
  // Initialize the required keys
  const requiredKeys = ['phone_number', 'password', 'full_name', 'latitude', 'longitude'];
  // Call the generic function signupUser
  signupUser(request, response, requiredKeys, ['full_name'], DRIVER_PHONE_ACCOUNT_TYPE, Driver, DRIVERS_REPO_NAME);
});


/*
    * @route : POST /api/drivers/signin
    * @description : make a citizen authentication
    * @Request body :
      {
          phone_number : <string>{required},
          password : <string>{required},
      }
    * @Response body :
      - 400, 403 :
        { success : <boolean>, msg : <string> }
      - 200 :
        { success : <boolean>, token : <string> }
*/
router.post('/signin', (request, response) => {
  // Call the generic function signinUser
  signinUser(Driver, request, response, DRIVER_PHONE_ACCOUNT_TYPE);
});

/*
    * @route : PATCH /api/drivers/<driver_id>/ambulance/
    * @description : Update the ambulance driver
    * @Request body :
      {
          ambulance_id : <string>{required},
      }
    * @Response body :
      - 400 :
        { success : <boolean>, msg : <string> }
      - 201 :
        { success : <boolean> }
*/
router.patch('/:driver_id/ambulance', uploadMiddleware.single('image'), (request, response) => {
  // Initialize the required keys
  const requiredKeys = ['ambulance_id'];

  // Check if the request body contains all the required fields
  verifyRequiredFields(request, response, requiredKeys).then(() => {
    // Check the existence of the driver
    GenericDAO.findOne(Driver, { _id: request.params.driver_id }, (er, driver) => {
      // If the driver does not exist, send an error
      if (er || !driver) {
        return response.status(400).json({ success: false, msg: DRIVER_NOT_FOUND });
      }
      // Check the existence of the ambulance
      return GenericDAO.findOne(Ambulance, { _id: request.body.ambulance_id }, (err, ambulance) => {
        if (err || !ambulance) {
          return response.status(400).json({ success: false, msg: AMBULANCE_NOT_FOUND });
        }
        // Update the driver
        return GenericDAO.updateFields(Driver, { _id: request.params.driver_id },
          { ambulance_id: request.body.ambulance_id },
          (error) => {
            if (err) response.status(500).json({ success: false, msg: error });
            response.status(200).json({ success: true });
          });
      });
    });
  });
});

module.exports = {
  router,
  DRIVERS_REPO_NAME
};
