/*
  * @file-description : this file exports a generic data access object to manipulate
    the business objects
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const Ambulance = require('../bo/ambulance.bo');
const Driver = require('../bo/driver.bo');
const Citizen = require('../bo/citizen.bo');
const Alarm = require('../bo/alarm.bo');
const Feedback = require('../bo/feedback.bo');
const Hospital = require('../bo/hospital.bo');


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
      return resolve(businessObject);
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

/*
    * @function
    * @description : find available ambulances by hospital Id
    * @param{hospitalId}[string] : the hospital Id
    * @param{callback}[function] : the callback to call after executing the query
*/
function findAvailableAmbulancesByHospital(hospitalId, callback) {
  // Create the query params
  // const queryParams = {
  //   available: true,
  //   $or: [
  //     { hospital_id: { $exists: false } },
  //     { hospital_ids: hospitalId }
  //   ]
  // };

  const queryParams = {
    available: true,
    hospital_ids: hospitalId
  };

  // Find the results
  return find(Ambulance, queryParams, callback);
}

function updateFields(businessSchema, selector, updates, callback) {
  businessSchema.update(selector, { $set: updates }, callback);
}

function removeFields(businessSchema, selector, fieldsToRemove, callback) {
  find(businessSchema, selector, (err, instances) => {
    if (err || !instances) { return callback(err); }
    for (let i = 0; i < instances.length; i += 1) {
      console.log(instances[i]);
      for (let j = 0; j < fieldsToRemove.length; j += 1) {
        const field = fieldsToRemove[j];
        console.log(field);
        instances[i].set(field, undefined, { strict: false });
        // instances[i][field] = undefined;
      }

      instances[i].save();
    }

    return callback();
  });
}

const findAmbulanceDriver = ambulanceId => new Promise((resolve, reject) => {
  findOne(Driver, { ambulance_id: ambulanceId }, (err, driver) => {
    if (err || !driver) return reject(err);
    return resolve(driver);
  });
});

function deactivateCitizenAccount(citizenId, callback) {
  updateFields(Citizen, { _id: citizenId }, { active: false }, callback);
}

function saveAlarmAsFalse(alarmId, driverId) {
  updateFields(Alarm, { _id: alarmId }, { isFake: true, responsible_driver_id: driverId },
    (err) => {
      if (err) {
        console.log('saveAlarmAsFalse error :');
        console.log(err);
      }
    });
}

function getAmbulanceAverageRating(ambulanceId) {
  return new Promise((resolve, reject) => {
    findAmbulanceDriver(ambulanceId)
      .then((driver) => {
        Feedback.aggregate([
          { $match: { driver_id: driver._id } },
          { $group: { _id: driver._id, average: { $avg: '$percentage' } } }
        ], (err, result) => {
          if (err) return reject(err);
          if (result.length > 0) { return resolve(Number(result[0].average.toFixed(2))); }
          return resolve(0);
        });
      })
      .catch((err) => {
        console.log('getAmbulanceAverageRating error :');
        console.log(err);
        reject(err);
      });
  });
}

function calculateAmbulanceRatings(ambulancesParam) {
  const ambulances = [...ambulancesParam];
  return new Promise((resolve) => {
    const addRate = (i) => {
      getAmbulanceAverageRating(ambulances[i])
        .then((averageRating) => {
          ambulances[i]._doc.rating = averageRating;
        })
        .catch(err => console.log(`addAmbulanceRatings error : ${err}`))
        .finally(() => {
          if (i + 1 < ambulances.length) {
            addRate(i + 1);
          } else {
            resolve(ambulances);
          }
        });
    };

    addRate(0);
  });
}

function remove(businessSchema, selector) {
  return new Promise((resolve, reject) => {
    businessSchema.remove(selector, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

function findHospitalsByAmbulanceId(ambulanceId) {
  return new Promise((resolve, reject) => {
    findOne(Ambulance, { _id: ambulanceId }, (err, ambulance) => {
      if (err) { return reject(err); }
      if (!ambulance) return reject('Ambulance not found');
      return find(Hospital, { _id: { $in: ambulance.hospital_ids } }, (err2, hospitals) => {
        if (err2) { return reject(err2); }
        return resolve(hospitals);
      });
    });
  });
}

function findHospitalsByPartnerId(partnerId) {
  const calculateAmbulancesForHospitals = (resolve, hospitals, i) => {
    if (i === hospitals.length) {
      return resolve(hospitals);
    }

    return Ambulance.count({ hospital_ids: hospitals[i]._id }, (err, numberOfAmbulances) => {
      hospitals[i]._doc.number_of_ambulances = numberOfAmbulances;
      return calculateAmbulancesForHospitals(resolve, hospitals, i + 1);
    });
  };

  return new Promise((resolve, reject) => {
    find(Hospital, { partner_id: partnerId }, (err, hospitals) => {
      if (err) { return reject(err); }
      return calculateAmbulancesForHospitals(resolve, hospitals, 0);
    });
  });
}


// Export the module
module.exports = {
  save,
  find,
  remove,
  findOne,
  updateFields,
  removeFields,
  findAvailableAmbulancesByHospital,
  findHospitalsByAmbulanceId,
  findHospitalsByPartnerId,
  findAmbulanceDriver,
  deactivateCitizenAccount,
  saveAlarmAsFalse,
  calculateAmbulanceRatings
};
