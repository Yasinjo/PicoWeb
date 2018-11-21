/*
    * @function
    * @description : get the an authorization token from the request headers
    * @param{headers}[Object] : the http request headers
    * @return{string} : The extracted token
*/
function getToken(headers) {
  // Check the headers for authorization token
  if (headers && headers.authorization) {
    /* Remember the token that we send in /api/citizens/signin hass the following structure
        '{token_type} {token}', so we need to extract jut the token part */
    const parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    }
    return null;
  }
  return null;
}

module.exports = getToken;
