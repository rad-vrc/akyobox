/**
 * Download the ending video from R2 (or any HTTPS URL) to the local Videos dir
 * so that Unity can load it from the same origin as the other background videos.
 *
 * Usage: node scripts/fetch-ending.js
 * Env:   ENDING_VIDEO_URL (optional) - defaults to the Workers URL
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const DEFAULT_URL = "https://akyobox-uploader.dorado1031.workers.dev/ending.mp4";
const url = process.env.ENDING_VIDEO_URL || DEFAULT_URL;

const targetDir = path.join(__dirname, "..", "public", "games", "whack-a-devilyagiakyo", "Videos");
const targetFile = path.join(targetDir, "Ending.mp4");

function download() {
  return new Promise((resolve, reject) => {
    if (!url.startsWith("https://")) {
      return reject(new Error(`ENDING_VIDEO_URL must be https://... (got ${url})`));
    }

    fs.mkdirSync(targetDir, { recursive: true });

    const file = fs.createWriteStream(targetFile);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          file.close();
          fs.rmSync(targetFile, { force: true });
          return reject(new Error(`Download failed: ${res.statusCode} ${res.statusMessage}`));
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`Downloaded ending video -> ${targetFile}`);
          resolve();
        });
      })
      .on("error", (err) => {
        file.close();
        fs.rmSync(targetFile, { force: true });
        reject(err);
      });
  });
}

download().catch((err) => {
  console.error("Failed to fetch ending video:", err.message);
  process.exit(1);
});
