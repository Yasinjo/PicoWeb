const socketIO = require('socket.io');
const { extractCitizenIdFromToken } = require('../auth/tokenExtractors');

const AUNTENTICATION_EVENT = 'AUNTENTICATION_EVENT';
const AUNTENTICATED_EVENT = 'AUNTENTICATED_EVENT';

let io = null;

function socketAuth(socket) {
  socket.auth = false;
  socket.on(AUNTENTICATION_EVENT, (data) => {
    extractCitizenIdFromToken(data.token)
      .then((citizenId) => {
        socket.auth = true;
        socket.citizenId = citizenId;
        socket.emit(AUNTENTICATED_EVENT, { success: true, socket_id: socket.id });
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
      .then(citizenId => ((socket.citizenId === citizenId) ? resolve(socket) : reject()))
      .catch(() => reject);
  });
}

module.exports = {
  init,
  matchSocketToToken
};
