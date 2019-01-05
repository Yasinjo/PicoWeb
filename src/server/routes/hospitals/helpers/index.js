/*
  * @file-description : this file exports some helpers to /api/hospitals/* routes
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const _ = require('lodash');
const GenericDAO = require('../../../dao/genericDAO');
const Hospital = require('../../../bo/hospital.bo');
const Driver = require('../../../bo/driver.bo');
const getToken = require('../../../helpers/getToken');
const { extractUserObjectFromToken, extractUserIdFromToken } = require('../../../auth/tokenExtractors');


/*
    * @function
    * @description : get all the hospitals added by a partner
    * @param{request}[Object] : the http request object
    * @param{response}[Object] : the http response object
    * @Request header :
        Authorization : <string>{required} ==> The token
    * @Response body :
      - 403
      - 500
      - 200 :
        { success : <boolean>,
          hospitals : [
            {
                _id : <string>
                name : <string>,
                latitude : <number>,
                longiude : <number>
            }
          ]
        }
*/
function getAllHospitalsByPartner(request, response) {
  // Get the token from the request
  const token = getToken(request.headers);
  // Check the token
  if (token) {
    return extractUserIdFromToken(token)
      .then(partnerId => GenericDAO.findHospitalsByPartnerId(partnerId))
      .then(hospitals => response.status(200).send({ success: true, hospitals }))
      .catch((error) => {
        console.log('error :');
        console.log(error);
        response.status(400).send({ success: false, error });
      });
  }
  // If there is no token, send a 403 response
  return response.status(403).send({ success: false });
}

/*
    * @function
    * @description : get all the hospitals that the driver can deliver citizens to
    * @param{request}[Object] : the http request object
    * @param{response}[Object] : the http response object
    * @Request header :
        Authorization : <string>{required} ==> The token
    * @Response body :
      - 403
      - 400
      - 200 :
        { success : <boolean>,
          hospitals : [
            {
                _id : <string>
                name : <string>,
                latitude : <number>,
                longiude : <number>
            }
          ]
        }
*/
function getAllHospitalsByDriver(request, response) {
  // Get the token from the request
  const token = getToken(request.headers);
  // Check the token
  if (token) {
    // If there is a token, get the driver object from token
    return extractUserObjectFromToken(Driver, token)
      .then(driver => GenericDAO.findHospitalsByAmbulanceId(driver.ambulance_id))
      .then(hospitals => response.status(200).send({ success: true, hospitals }))
      .catch((error) => {
        console.log('error :');
        console.log(error);
        response.status(400).send({ success: false, error });
      });
  }
  // If there is no token, send a 403 response
  return response.status(403).send({ success: false });
}

/*
    * @function
    * @description : get all the hospitals that the driver can deliver citizens to
    * @param{request}[Object] : the http request object
    * @param{response}[Object] : the http response object
    * @Request header :
        Authorization : <string>{required} ==> The token
    * @Response body :
      - 403
      - 500
      - 200 :
        { success : <boolean>,
          hospitals : [
            {
                _id : <string>
                name : <string>,
                latitude : <number>,
                longiude : <number>
            }
          ]
        }
*/
function getAllHospitals(request, response) {
  // Get the token from the request
  const token = getToken(request.headers);
  // Check the token
  if (token) {
    // If there is a token, fetch hospitals from database
    return GenericDAO.find(Hospital, {}, (err, hospitals) => {
      // If there is an error, send it in response
      if (err) response.status(500).send(err);
      // Otherwise, send the hospitals in response
      return response.status(200).send({ success: true, hospitals });
    });
  }
  // If there is no token, send a 403 response
  return response.status(403).send({ success: false });
}

/*
    * @function
    * @description : get ambulances that can pick us up to a specific hospital
    * @param{request}[Object] : the http request object
    * @param{response}[Object] : the http response object
    * @Response body :
      - 403
      - 500
      - 200 :
        {
          success : <boolean>,
          ambulances : [
            {
                _id : <string>,
                registration_number : <string>,
                latitude : <number>,
                longiude : <number>,
                available : <boolean>,
                rating : <number>,
                hospital_ids : [<string>]
            }
          ]
        }
*/
function getAmbulancesByHospital(request, response) {
  // Get the token from the request
  const token = getToken(request.headers);
  // Check the token
  if (token) {
    // If there is a token, fetch ambulances from database
    return GenericDAO.findAvailableAmbulancesByHospital(request.params.hospital_id,
      (err, ambulances) => {
      // If there is an error, send it in response
        if (err) response.status(500).send(err);
        // otherwise, sen
        GenericDAO.calculateAmbulanceRatings(ambulances)
          .then(ambulancesResult => response.status(200)
            .send({ success: true, ambulances: ambulancesResult }));
      });
  }
  // If there is no token, send a 403 response
  return response.status(403).send({ success: false });
}

/*
    * @function
    * @description : save a hospital in the database
    * @param{request}[Object] : the http request object
    * @param{response}[Object] : the http response object
    * @Response body :
      - 500 :
        {
          success : <boolean>,
          error : <Object>
        }
      - 201 :
        {
          success : <boolean>,
          hospital_id : <string>
        }
*/
function saveHospital(request, response, dataKeys) {
  // Get the token from the request
  const token = getToken(request.headers);
  // Check the token
  if (token) {
    // If there is a token, get the partner id from the token and save the hospital
    return extractUserIdFromToken(token)
      .then((partnerId) => {
        const hospitalData = _.pick(request.body, dataKeys);
        const hospital = new Hospital({ ...hospitalData, partner_id: partnerId });
        GenericDAO.save(hospital)
          .then(() => response.status(201).send({ success: true, hospital_id: hospital._id }))
          .catch(error => response.status(500).send({ success: false, error }));
      })
      .catch((error) => {
        console.log('error :');
        console.log(error);
        response.status(400).send({ success: false, error });
      });
  }
  // If there is no token, send a 403 response
  return response.status(403).send({ success: false });
}

// Export the module
module.exports = {
  getAllHospitals,
  getAllHospitalsByDriver,
  getAllHospitalsByPartner,
  getAmbulancesByHospital,
  saveHospital
};
