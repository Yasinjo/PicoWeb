/*
  * @file-description : this file exports a generic data access object to manipulate
    the business objects
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

/*
    * @function
    * @description : save a businness object to the database
    * @param{businessObject}[mongoose object] : the business object to save
    * @return{Promise}
*/
function save(businessObject) {
  return new Promise((resolve, reject) => {
    // Save the object to the database
    businessObject.save((err) => {
      // If there is an error, send it with promise rejection
      if (err) { return reject(err); }
      // Otherwise, resolve the promise
      return resolve();
    });
  });
}

/*
    * @function
    * @description : find one instance by parametres
    * @param{businessSchema}[mongoose Schema] : the business object Schema to use
    * @param{params}[Object] : the parameteres to use with mongoose Schema
    * @param{callback}[function] : the callback to call after executing the query
*/
function findOne(businessSchema, params, callback) {
  return businessSchema.findOne(params, callback);
}

/*
    * @function
    * @description : find multiple instances by parametres
    * @param{businessSchema}[mongoose Schema] : the business object Schema to use
    * @param{params}[Object] : the parameteres to use with mongoose Schema
    * @param{callback}[function] : the callback to call after executing the query
*/
function find(businessSchema, params, callback) {
  return businessSchema.find(params, callback);
}

// Export the module
module.exports = {
  save,
  find,
  findOne
};
