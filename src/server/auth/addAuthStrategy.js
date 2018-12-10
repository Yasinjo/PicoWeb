/*
  * @file-description : this file exports a helper to add an authentication strategy to
    the auhentication manager (passport for example)
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const passportJwt = require('passport-jwt');
const GenericDAO = require('../dao/genericDAO');

const JwtStrategy = passportJwt.Strategy;
const { ExtractJwt } = passportJwt;
const authConfig = require('../../../config/auth.json');

/*
    * @function
    * @description : add an authentication strategy to the auhentication
      manager (passport for example)
    * @param{authManager}[object] : the authentication manager to use
    * @param{businessSchema}[mongoose Schema] : the business object Schema
      to use in token verification
*/
function addAuthStrategy(authManager, businessSchema, strategyName) {
  // Create the authentication strategy options
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = authConfig.secret;

  // Create the strategy using the options abovr
  const strategy = new JwtStrategy(opts, (jwtPayload, done) => {
    // To verify a token, we should find an existing item with the same id in the token
    GenericDAO.findOne(businessSchema, { id: jwtPayload.id }, (err, businessObject) => {
      if (err) { return done(err, false); }
      return (businessObject) ? done(null, true) : done(null, false);
    });
  });

  // Add the strategy to the authentication manager
  authManager.use(strategyName, strategy);
}

// Export the module
module.exports = addAuthStrategy;
