/*
  * @file-description : this file exports some helpers to /api/hospitals/* routes
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const GenericDAO = require('../../../dao/genericDAO');
const Hospital = require('../../../bo/hospital.bo');
const getToken = require('../../../helpers/getToken');

/*
    * @function
    * @description : get all the hospitals in from the database
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
        { success : <boolean>,
          ambulances : [
            {
                _id : <string>
                registration_number : <string>,
                latitude : <number>,
                longiude : <number>,
                available : <boolean>,
                hospital_id : <string>
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
    return GenericDAO.findAmbulancesByHospital(request.params.hospital_id, (err, ambulances) => {
      // If there is an error, send it in response
      if (err) response.status(500).send(err);
      // Otherwise, send the hospitals in response
      return response.status(200).send({ success: true, ambulances });
    });
  }
  // If there is no token, send a 403 response
  return response.status(403).send({ success: false });
}

// Export the module
module.exports = {
  getAllHospitals,
  getAmbulancesByHospital
};
