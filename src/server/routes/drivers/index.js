/*
  * @file-description : this file exports the router to use with /api/drivers/* requests
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const express = require('express');
const _ = require('lodash');
const Driver = require('../../bo/driver.bo');
const Ambulance = require('../../bo/ambulance.bo');
const GenericDAO = require('../../dao/genericDAO');
const verifyRequiredFields = require('../../helpers/verifyRequiredFields');
const { uploadPictureHelper, uploadMiddleware } = require('../../helpers/uploadPictureHelper');
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
  const requiredKeys = ['full_name'];

  // Check if the request body contains all the required fields
  verifyRequiredFields(request, response, requiredKeys).then(() => {
    // Create a driver business object from the request body
    const driver = new Driver(_.pick(request.body, requiredKeys));

    // Save the driver to the database
    return GenericDAO.save(driver)
      .then(() => {
        // Upload the image file (if there is an image), and send the response
        if (request.file && request.file.buffer) {
          uploadPictureHelper(request.file.buffer, driver._id, DRIVERS_REPO_NAME,
            () => response.status(201).json({ success: true }));
        } else { response.status(201).json({ success: true }); }
      })
      .catch((error) => {
        response.status(400).json({ success: false, error });
      });
  });
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
      GenericDAO.findOne(Ambulance, { _id: request.body.ambulance_id }, (err, ambulance) => {
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
router.post('/signin', (req, res) => {
  // Validate the citizen authentication
  validateCitizenAuth(req.body)
    .then((citizen) => {
      // If everything is correct, create a token
      const token = jwt.sign({ _id: citizen._id }, authConfig.secret);
      // Send the token in the response
      res.status(200).send({ success: true, token: `JWT ${token}` });
    }).catch(({ msg, status }) => {
      // If there is an error, send it in the response
      res.status(status).send({ success: false, msg });
    });
});

module.exports = {
  router
};
