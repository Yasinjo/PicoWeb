/*
  * @file-description : this file exports some helpers to /api/ambulances/* routes
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const _ = require('lodash');
const GenericDAO = require('../../../dao/genericDAO');
const Ambulance = require('../../../bo/ambulance.bo');
const Hospital = require('../../../bo/hospital.bo');
const { uploadPictureHelper } = require('../../../helpers/uploadPictureHelper');

const HOSPITAL_NOT_FOUND = 'Hospital not found';
const AMBULANCES_REPO_NAME = 'AMBULANCES_REPO_NAME';

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
  const ambulance = new Ambulance(_.pick(request.body, dataKeys));
  GenericDAO.save(ambulance)
    .then(() => {
      // Upload the image file (if there is an image), and send the response
      if (request.file && request.file.buffer) {
        uploadPictureHelper(request.file.buffer, ambulance._id, AMBULANCES_REPO_NAME,
          () => response.status(201).json({ success: true, ambulance_id: ambulance._id }));
      } else { response.status(201).json({ success: true, ambulance_id: ambulance._id }); }
    })
    .catch(error => response.status(500).send({ success: false, error }));

  // Check if the hospital exists
  // if (request.body.hospital_id) {
  //   GenericDAO.findOne(Hospital, { _id: request.body.hospital_id }, (error, hospital) => {
  //     if (error || !hospital) {
  //       return response.status(400).send({ success: false, error: HOSPITAL_NOT_FOUND });
  //     }

  //     return save();
  //   });
  // } else save();
}

module.exports = {
  saveAmbulance
};
