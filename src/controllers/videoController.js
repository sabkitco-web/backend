const stream = require("stream");
const ffmpeg = require("fluent-ffmpeg");
const { AUDIO_FORMAT_MAP } = require("../utils/const");

//  for local 
// ffmpeg.setFfmpegPath("/opt/homebrew/bin/ffmpeg"); 

// for vm
ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

async function extractAudio(req, res) {
  try {

    // Check if file exists
    if (!req.files || !req.files.length) {
      return res.status(400).send({
        status: false,
        data: {},
        msg: "Empty file",
      });
    }

    const { format = "mp3" } = req.body;
    const videoFile = req.files[0];
    const videoBuffer = videoFile.buffer;

    const videoStream = new stream.PassThrough();
    videoStream.end(videoBuffer);
    const chunks = [];
    const selected = AUDIO_FORMAT_MAP[format.toLowerCase()] || { format: "mp3" };

    // Convert video to audio in memory
    await new Promise((resolve, reject) => {

        const outputStream = new stream.PassThrough();
        let command = ffmpeg(videoStream).noVideo().toFormat(selected.format);
        // Only set codec if it exists
        if (selected.codec) {
            command = command.audioCodec(selected.codec);
        }
        command
            .on("error", (err) => reject(err))
            .pipe(outputStream, { end: true });

        outputStream.on("data", (chunk) => chunks.push(chunk));
        outputStream.on("end", resolve);
        outputStream.on("error", (err) => reject(err));
    });

    // Combine all chunks into a single buffer
    const audioBuffer = Buffer.concat(chunks);

    // Send audio buffer in JSON
    res.status(200).send({
      status: true,
      data: audioBuffer,
      msg: "Audio extracted successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      msg: err?.message || "Error processing video",
    });
  }
}

module.exports = { extractAudio };
