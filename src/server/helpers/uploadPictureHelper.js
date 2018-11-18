const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsPath = path.resolve('public', 'uploads', 'citizens');

function uploadPictureHelper(imageBuffer, imageNewFileName, callback) {
  const newPath = `${uploadsPath}/${imageNewFileName}`;
  fs.writeFile(newPath, imageBuffer, callback);
}

const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage });

module.exports = {
  uploadMiddleware,
  uploadPictureHelper
};
