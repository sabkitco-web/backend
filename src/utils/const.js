
// const VIDEO_MIN_TYPES = {
//   "video/mp4": "mp4",
//   "video/quicktime": "mov",
//   "video/webm": "webm",
//   "video/x-msvideo": "avi",
//   "video/avi": "avi",
//   "video/x-flv": "flv",
//   "video/x-ms-wmv": "wmv",
//   "video/x-ms-asf": "asf",
//   "video/3gpp": "3gp",
//   "video/3gpp2": "3g2",
//   "video/x-matroska": "mkv",
//   "video/ogg": "ogv",
//   "video/x-mng": "mng",
//   "video/MP2T": "ts",
//   "video/x-ms-vob": "vob",
//   "video/x-f4v": "f4v",
//   "video/x-m4v": "m4v",
//   "video/divx": "divx",
//   "video/x-dv": "dv",
//   "video/xvid": "xvid"
// };

// Format mapping
const AUDIO_FORMAT_MAP = {
  mp3: { format: "mp3" },
  wav: { format: "wav" },
  aac: { format: "adts", codec: "aac" },
  m4a: { format: "mp4", codec: "aac" },
  flac: { format: "flac" },
  ogg: { format: "ogg", codec: "libvorbis" },
  opus: { format: "ogg", codec: "libopus" },
  aiff: { format: "aiff" },
  ac3: { format: "ac3" },
  // add more as needed
};

// const VIDEO_FORMATS = [
//   "mp4",   // Most common, works everywhere
//   "mov",   // QuickTime, iPhones, cameras
//   "avi",   // Older Windows format
//   "mkv",   // Matroska, often for HD/4K
//   "webm",  // Web video format, HTML5
//   "flv",   // Flash video (rare nowadays)
//   "wmv",   // Windows Media Video
//   "m4v",   // iTunes video
//   "mpeg",  // Older MPEG-1/2 videos
//   "3gp",   // Older phones / mobile
// ];

module.exports = {
    AUDIO_FORMAT_MAP
}
