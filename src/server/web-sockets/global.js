const { CITIZEN_SOCKET_TYPE, DRIVER_SOCKET_TYPE } = require('./constants/index');
const { initCitizenSocket } = require('./citizens/index');
const { initDriverSocket } = require('./drivers/index');

function socketConnectionHandler(socket) {
  if (socket.handshake.query.userType === CITIZEN_SOCKET_TYPE) {
    initCitizenSocket(socket);
  } else if (socket.handshake.query.userType === DRIVER_SOCKET_TYPE) {
    initDriverSocket(socket);
  }
}

module.exports = {
  socketConnectionHandler
};
