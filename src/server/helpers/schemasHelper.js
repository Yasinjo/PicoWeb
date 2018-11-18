const bcrypt = require('bcrypt-nodejs');

function preSave(next) {
  const user = this;
  if (this.isModified('password') || this.isNew) {
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

function comparePassword(passw, cb) {
  bcrypt.compare(passw, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    return cb(null, isMatch);
  });
}

module.exports = {
  preSave,
  comparePassword
};
