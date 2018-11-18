/*
  * @file-description : this file exports a helper to verify the required fields
    in the body of an http request
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const _ = require('lodash');

/*
    * @function
    * @description : verify the required fields in the body of a http request
    * @param{request}[object] : the express request object
    * @param{response}[object] : the express response object
    * @param{requiredKeys}[array{string}] : the keys of the required fields
*/
function verifyRequiredFields(request, response, requiredKeys) {
  return new Promise((resolve) => {
    // Check the required fields keys
    const requiredKeysTest = _.every(requiredKeys, _.partial(_.has, request.body));
    // Resolve the promise if everything is alright
    if (requiredKeysTest) resolve();
    // Otherwise send a 'bad request' http response
    else response.status(400).json({ success: false, msg: 'Please provide all the required data.' });
  });
}

// Export the module
module.exports = verifyRequiredFields;
