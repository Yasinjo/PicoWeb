/*
  * @file-description : this file exports the router to use with /api/drivers/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const path = require('path');
const express = require('express');
const passport = require('passport');

const getToken = require('../../helpers/getToken');
const { extractUserIdFromToken } = require('../../auth/tokenExtractors');
const Driver = require('../../bo/driver.bo');
const { DRIVER_PHONE_ACCOUNT_TYPE } = require('../../bo/phone_account.bo');
const verifyRequiredFields = require('../../helpers/verifyRequiredFields');
const { uploadMiddleware, UPLOADS_PATH } = require('../../helpers/uploadPictureHelper');
const {
  signupUser, signinUser, retreiveUserData, changeUserPassword, changeUserImage
} = require('../../helpers/genericRoutesHelper');
const { getDriversByPartner, updateDriver, deleteDriver } = require('./helpers/index');
const addAuthStrategy = require('../../auth/addAuthStrategy');

const DRIVER_AUTH_STRATEGY_NAME = 'Driver-auth-strategy';
const { PARTNER_AUTH_STRATEGY_NAME } = require('../partners/index');

const DRIVERS_REPO_NAME = 'DRIVERS_REPO_NAME';
// Create the router
const router = express.Router();

// Add the driver authentication strategy to the passport module
addAuthStrategy(passport, Driver, DRIVER_AUTH_STRATEGY_NAME, false);

/*
    * @route : POST /api/drivers/signup
    * @description : make a driver subscription
    * @Request body :
      {
          full_name : <string>{required},
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
router.post('/', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }),
  uploadMiddleware.single('image'), (request, response) => {
  // Initialize the required keys
    const requiredKeys = ['phone_number', 'password', 'full_name'];
    const token = getToken(request.headers);
    extractUserIdFromToken(token)
      .then((partnerId) => {
        // Call the generic function signupUser
        request.body.partner_id = partnerId;
        signupUser(request, response, requiredKeys, ['full_name', 'partner_id'], DRIVER_PHONE_ACCOUNT_TYPE, Driver, DRIVERS_REPO_NAME);
      });
  });


/*
    * @route : POST /api/drivers/signin
    * @description : make a driver authentication
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
// router.patch('/:driver_id/ambulance', uploadMiddleware.single('image'), (request, response) => {
//   // Initialize the required keys
//   const requiredKeys = ['ambulance_id'];

//   // Check if the request body contains all the required fields
//   verifyRequiredFields(request, response, requiredKeys).then(() => {
//     // Check the existence of the driver
//     GenericDAO.findOne(Driver, { _id: request.params.driver_id }, (er, driver) => {
//       // If the driver does not exist, send an error
//       if (er || !driver) {
//         return response.status(400).json({ success: false, msg: DRIVER_NOT_FOUND });
//       }
//       // Check the existence of the ambulance
//       return GenericDAO.findOne(Ambulance, { _id: request.body.ambulance_id },
//        (err, ambulance) => {
//         if (err || !ambulance) {
//           return response.status(400).json({ success: false, msg: AMBULANCE_NOT_FOUND });
//         }
//         // Update the driver
//         return GenericDAO.updateFields(Driver, { _id: request.params.driver_id },
//           { ambulance_id: request.body.ambulance_id },
//           (error) => {
//             if (err) response.status(500).json({ success: false, msg: error });
//             response.status(200).json({ success: true });
//           });
//       });
//     });
//   });
// });


/*
    * @route : GET /api/drivers
    * @description : get all the drivers added by a partner
*/
router.get('/', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => getDriversByPartner(request, response));

/*
    * @route : PATCH /api/drivers/:driver_id
    * @description : update the data of a driver
*/
router.patch('/:driver_id', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }), uploadMiddleware.single('image'),
  (request, response) => {
  // Initialize the required keys
    const requiredKeys = ['full_name', 'phone_number'];
    // Verify the required fields and update the driver
    verifyRequiredFields(request, response, requiredKeys)
      .then(() => {
        updateDriver(request, response, request.params.driver_id);
      });
  });

/*
    * @route : DELETE /api/drivers/:driver_id
    * @description : delete a driver
*/
router.delete('/:driver_id', passport.authenticate(PARTNER_AUTH_STRATEGY_NAME, { session: false }),
  (request, response) => {
    const driverId = request.params.driver_id;
    deleteDriver(request, response, driverId);
  });


/*
    * @route : GET /api/drivers/data
    * @description : get the name and the id of the connected driver
    * @Request header :
        Authorization : token <String>
    * @Response body :
      - 400, 403 :
      - 200 :
        { id : <string>, full_name : <string> }
*/
router.get('/data', passport.authenticate(DRIVER_AUTH_STRATEGY_NAME, { session: false }), (request, response) => {
  retreiveUserData(request, response, Driver, ['full_name', '_id']);
});

/*
    * @route : PATCH /api/drivers/password
    * @description : change the driver password
    * @Request body :
      {
          password : <string>{required}
      }
    * @Request header :
        Authorization : token <String>
    * @Response body :
      - 500, 403
      - 200
*/
router.patch('/password', passport.authenticate(DRIVER_AUTH_STRATEGY_NAME, { session: false }), (request, response) => {
  changeUserPassword(request, response, Driver);
});

/*
    * @route : PATCH /api/drivers/image
    * @description : change the driver image
    * @Request body :
      {
          image : file
      }
    * @Request header :
        Authorization : token <String>
    * @Response body :
      - 400, 403
      - 200
*/
router.patch('/image', passport.authenticate(DRIVER_AUTH_STRATEGY_NAME, { session: false }), uploadMiddleware.single('image'),
  (request, response) => {
    changeUserImage(request, response, DRIVERS_REPO_NAME);
  });

// Image routing
router.use('/image', express.static(path.join(UPLOADS_PATH, DRIVERS_REPO_NAME)));

module.exports = {
  router,
  DRIVERS_REPO_NAME,
  DRIVER_AUTH_STRATEGY_NAME
};
