/*
  * @file-description : this file exports some helpers to /api/ambulances/* routes
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const _ = require('lodash');
const GenericDAO = require('../../../dao/genericDAO');
const Ambulance = require('../../../bo/ambulance.bo');
const Driver = require('../../../bo/driver.bo');
// const Hospital = require('../../../bo/hospital.bo');
const { uploadPictureHelper } = require('../../../helpers/uploadPictureHelper');
const getToken = require('../../../helpers/getToken');
const { extractUserIdFromToken } = require('../../../auth/tokenExtractors');

const AMBULANCES_REPO_NAME = 'AMBULANCES_REPO_NAME';

// const HOSPITAL_NOT_FOUND = 'Hospital not found';

/*
    * @function
    * @description : save an ambulance in the database
    * @param{request}[Object] : the http request object
    * @param{response}[Object] : the http response object
    * @Response body :
      - 400 :
        {
          success : <boolean>,
          error : <Object>
        }
      - 500 :
        {
          success : <boolean>,
          error : <Object>
        }
      - 201 :
        {
          success : <boolean>,
          ambulance_id : <string>
        }
*/
function saveAmbulance(request, response, dataKeys) {
  // Get the token from the request
  const token = getToken(request.headers);
  // Check the token
  if (token) {
    // If there is a token, get the partner id from the token and save the hospital
    return extractUserIdFromToken(token)
      .then((partnerId) => {
        const ambulanceData = _.pick(request.body, [...dataKeys, 'hospital_ids']);
        const ambulance = new Ambulance({ ...ambulanceData, partner_id: partnerId });
        GenericDAO.save(ambulance)
          .then(() => {
            // Upload the image file (if there is an image), and send the response
            if (request.file && request.file.buffer) {
              uploadPictureHelper(request.file.buffer, ambulance._id, AMBULANCES_REPO_NAME,
                () => response.status(201).json({ success: true, ambulance_id: ambulance._id }));
            } else { response.status(201).json({ success: true, ambulance_id: ambulance._id }); }
          })
          .catch(error => response.status(500).send({ success: false, error }));
      })
      .catch((error) => {
        console.log('saveAmbulance error :');
        console.log(error);
        response.status(400).send({ success: false, error });
      });
  }

  // If there is no token, send a 403 response
  return response.status(403).send({ success: false });
}

function addDriverIdToAmbulance(ambulances, index, callback) {
  if (index === ambulances.length) { return callback(); }

  return GenericDAO.findAmbulanceDriver(ambulances[index]._id)
    .then((driver) => {
      ambulances[index]._doc.driver_id = driver._id;
      addDriverIdToAmbulance(ambulances, index + 1, callback);
    })
    .catch(() => addDriverIdToAmbulance(ambulances, index + 1, callback));
}

function getAmbulancesByPartner(request, response) {
  const token = getToken(request.headers);
  extractUserIdFromToken(token)
    .then((partnerId) => {
      GenericDAO.find(Ambulance, { partner_id: partnerId }, (err, ambulances) => {
      // If there is an error, send it in response
        if (err) return response.status(500).send(err);
        // Otherwise, send the hospitals in response
        return addDriverIdToAmbulance(ambulances, 0,
          () => response.status(200).send({ success: true, ambulances }));
      });
    });
}

function updateAmbulanceDriver(ambulanceId, driverId, callback) {
  GenericDAO.updateFields(Driver, { ambulance_id: ambulanceId }, { ambulance_id: null }, () => {
    if (driverId) {
      GenericDAO.updateFields(Driver, { _id: driverId }, { ambulance_id: ambulanceId }, callback);
    } else { callback(); }
  });
}

function updateAmbulance(request, response, ambulanceId, dataKeys) {
  const token = getToken(request.headers);
  extractUserIdFromToken(token)
    .then((partnerId) => {
      const ambulanceData = _.pick(request.body, [...dataKeys, 'driver_id', 'hospital_ids']);
      GenericDAO.findOne(Ambulance, { _id: ambulanceId, partner_id: partnerId },
        (err, ambulance) => {
          // If there is an error, send it in response
          if (err || !ambulance) response.status(400).send({ error: 'Ambulance not found' });
          GenericDAO.updateFields(Ambulance, { _id: ambulanceId }, _.pick(ambulanceData, [...dataKeys, 'hospital_ids']),
            (err2) => {
              const sendResponse = () => {
                if (err2) {
                  response.status(400).send({ error: 'Update error', msg: err2 });
                } else {
                  response.status(202).send();
                }
              };

              updateAmbulanceDriver(ambulanceId, ambulanceData.driver_id, () => {
                if (request.file && request.file.buffer) {
                  uploadPictureHelper(request.file.buffer, ambulance._id,
                    AMBULANCES_REPO_NAME, sendResponse);
                } else sendResponse();
              });
            });
        });
    });
}

function verifyPartnerRightOnAmbulance(request, ambulanceId) {
  // Get the token from the request
  const token = getToken(request.headers);
  console.log('1 : ');
  // verify the rights
  return new Promise((resolve, reject) => {
    extractUserIdFromToken(token)
      .then((partnerId) => {
        GenericDAO.findOne(Ambulance, { _id: ambulanceId, partner_id: partnerId },
          (err, ambulance) => {
            console.log('2 : ');
            console.log(err);
            console.log(ambulance);

            if (err || !ambulance) { return reject(); }
            return resolve();
          });
      });
  });
}

function deleteAmbulance(request, response, ambulanceId) {
  verifyPartnerRightOnAmbulance(request, ambulanceId).then(() => {
    GenericDAO.updateFields(Driver, { ambulance_id: ambulanceId }, { ambulance_id: null }, () => {
      GenericDAO.remove(Ambulance, { _id: ambulanceId })
        .then(response.status(200).send())
        .catch((err) => {
          console.log('DELETE /api/ambulances/:ambulance_id error :');
          console.log(err);
          response.status(400).send();
        });
    });
  }).catch(() => response.status(400).send());
}

module.exports = {
  saveAmbulance,
  deleteAmbulance,
  getAmbulancesByPartner,
  updateAmbulance,
  AMBULANCES_REPO_NAME
};
