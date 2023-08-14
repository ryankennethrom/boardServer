const mongoose = require('mongoose');


canvasImagesSchema = new mongoose.Schema({
    id: String,
    image: String
});

module.exports = mongoose.model('CanvasImages', canvasImagesSchema);


