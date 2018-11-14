const _ = require('lodash');

function verifyRequuiredFields(request, response, requiredKeys) {
  console.log('request.body');
  console.log(request.body);
  return new Promise((resolve) => {
    const requiredKeysTest = _.every(requiredKeys, _.partial(_.has, request.body));
    if (requiredKeysTest) resolve();
    else response.status(400).json({ success: false, msg: 'Please provide all the required data.' });
  });
}

module.exports = verifyRequuiredFields;
