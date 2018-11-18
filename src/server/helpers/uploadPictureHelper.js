/*
  * @file-description : this file exports a helper to upload a picture to the server
  * @author{Slimane AKALIA} slimaneakalia@gmail.com
*/

// Import the required modules
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Get the uploads path
const uploadsPath = path.resolve('public', 'uploads', 'citizens');

// Customize the multer middleware to work on memory
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage });

/*
    * @function
    * @description : upload a picture to the server
    * @param{imageBuffer}[buffer] : the image to upload
    * @param{imageNewFileName}[string] : the image new file name
    * @param{callback}[function] : the function to call after uploading the picture
*/
function uploadPictureHelper(imageBuffer, imageNewFileName, callback) {
  const newPath = `${uploadsPath}/${imageNewFileName}`;
  fs.writeFile(newPath, imageBuffer, callback);
}

// Export the module
module.exports = {
  uploadMiddleware,
  uploadPictureHelper
};
