const socketIO = require('socket.io');
const { extractCitizenIdFromToken } = require('../auth/tokenExtractors');
const GenericDAO = require('../dao/genericDAO');
const Citizen = require('../bo/citizen.bo');

const CITIZEN_AUNTENTICATION_EVENT = 'CITIZEN_AUNTENTICATION_EVENT';
const CITIZEN_AUNTENTICATED_EVENT = 'CITIZEN_AUNTENTICATED_EVENT';

let io = null;

function socketAuth(socket) {
  socket.auth = false;
  socket.on(CITIZEN_AUNTENTICATION_EVENT, (data) => {
    extractCitizenIdFromToken(data.token)
      .then((citizenId) => {
        GenericDAO.findOne(Citizen, { _id: citizenId }, (err) => {
          if (err) return;
          socket.auth = true;
          socket.citizenId = citizenId;
          socket.emit(CITIZEN_AUNTENTICATED_EVENT, { success: true, socket_id: socket.id });
        });
        // Android communication
      }).catch();
  });
}

function initSocket(socket) {
  socketAuth(socket);
}

function init(server) {
  io = socketIO(server);
  io.on('connection', (socket) => {
    initSocket(socket);
  });
}

function matchSocketToToken(socketId, token) {
  return Promise((resolve, reject) => {
    const socket = this.io.sockets.connected[socketId];
    if (!socket) return reject();

    return extractCitizenIdFromToken(token)
      .then(citizenId => ((socket.citizenId === citizenId) ? resolve(socket, citizenId) : reject()))
      .catch(() => reject);
  });
}

module.exports = {
  init,
  matchSocketToToken
};
