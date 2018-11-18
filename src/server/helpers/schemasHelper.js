/*
  * @file-description : this file exports some helpers to the business objects schemas
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const bcrypt = require('bcrypt-nodejs');

/*
    * @function
    * @description : crypt password before saving a user (citizen, partner or driver)
    * @param{next}[function] : the function to call after making the modification
*/
function preSaveAccount(next) {
  const user = this;
  // If the current user is new or there is a password update
  if (user.isModified('password') || user.isNew) {
    // Crypt the password
    return bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }

      return bcrypt.hash(user.password, salt, null, (hashError, hash) => {
        if (hashError) {
          return next(hashError);
        }
        user.password = hash;
        return next();
      });
    });
  }
  return next();
}

/*
    * @function
    * @description : used in the user authentication (citizen, partner or driver)
    * @param{passw}[string] : the password to compare with
    * @param{cb}[function] : the function to call after finishing the comparison
*/
function comparePassword(passw, cb) {
  bcrypt.compare(passw, this.password, cb);
}

// Export the module
module.exports = {
  preSaveAccount,
  comparePassword
};
