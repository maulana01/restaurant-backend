/** @format */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dcdu2v41u',
  api_key: '189369424679696',
  api_secret: 'xO_NsHIMoLR3yqPLraq0I0yKbC0',
});

exports.upload = (folderDestination) => {
  multer.diskStorage({
    destination: folderDestination == 'menus' ? 'public/images/menus' : 'public/images/categories',
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });

  const storageCloudinary = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      return {
        folder: folderDestination == 'menus' ? 'public/images/menus' : 'public/images/categories',
        allowed_formats: ['jpg', 'png', 'jpeg'],
      };
    },
  });

  return multer({ storage: storageCloudinary });
};
