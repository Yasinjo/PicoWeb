const passportJwt = require('passport-jwt');
const GenericDAO = require('../dao/genericDAO');

const JwtStrategy = passportJwt.Strategy;
const { ExtractJwt } = passportJwt;
const authConfig = require('../../../config/auth.json');

function addAuthStrategy(authManager, businessSchema, strategyName) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = authConfig.secret;

  const strategy = new JwtStrategy(opts, (jwtPayload, done) => {
    GenericDAO.findOne(businessSchema, { id: jwtPayload.id }, (err, businessObject) => {
      if (err) { return done(err, false); }
      return (businessObject) ? done(null, businessObject) : done(null, false);
    });
  });

  authManager.use(strategyName, strategy);
}

module.exports = addAuthStrategy;
