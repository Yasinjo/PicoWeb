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
function addAuthStrategy(authManager, businessSchema, strategyName, verifyActivation) {
  // Create the authentication strategy options
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = authConfig.secret;

  // Create the strategy using the options abovr
  const strategy = new JwtStrategy(opts, (jwtPayload, done) => {
    // To verify a token, we should find an existing item with the same id in the token
    GenericDAO.findOne(businessSchema, { _id: jwtPayload._id }, (err, businessObject) => {
      if (err || !businessObject) { return done(err, false); }
      console.log(`businessObject.id : ${jwtPayload._id} , ${businessObject._id} `);
      console.log(businessObject);
      return (verifyActivation) ? done(null, businessObject.isActive()) : done(null, true);
    });
  });

  // Add the strategy to the authentication manager
  authManager.use(strategyName, strategy);
}

// Export the module
module.exports = addAuthStrategy;
