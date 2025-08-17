const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Handler for /video/extract-audio
router.post('/extract-audio', videoController.extractAudio);

module.exports = router;
