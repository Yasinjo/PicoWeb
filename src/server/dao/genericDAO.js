function save(businessObject) {
  return new Promise((resolve, reject) => {
    businessObject.save((err) => {
      if (err) {
        console.log('Error was detected');
        console.log(err);
        return reject(err);
      }

      console.log('Everything is alright');
      return resolve();
    });
  });
}

function findOne(businessSchema, params, callback) {
  return businessSchema.findOne(params, callback);
}

function find(businessSchema, params, callback) {
  return businessSchema.find(params, callback);
}

module.exports = {
  save,
  find,
  findOne
};
