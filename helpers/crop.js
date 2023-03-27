const Jimp = require('jimp');

const crop= function(req, res, next) {
  const files = req.files;

  // perform crop operation on each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filename = file.filename;
    const path = file.path;

    // read the file using Jimp
    Jimp.read(path, function (err, image) {
      if (err) throw err;

      // crop the image to a square shape
      const size = Math.min(image.bitmap.width, image.bitmap.height);
      image.crop(0, 0, size, size);

      // save the cropped image
      const croppedPath = `cropped/${filename}`;
      image.write(croppedPath);
    });
  }

  res.send('Crop operation complete');
};

module.exports = {crop}