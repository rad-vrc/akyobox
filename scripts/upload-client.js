
const fs = require('fs');
const path = require('path');

const WORKER_URL = "https://akyobox-uploader.dorado1031.workers.dev";
const FILE_PATH = "public/games/whack-a-devilyagiakyo/ending.mp4";
const KEY = "ending.mp4";
const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB

async function upload() {
    const fileSize = fs.statSync(FILE_PATH).size;
    console.log(`Uploading ${FILE_PATH} (${fileSize} bytes) to ${WORKER_URL}/${KEY}`);

    // 1. Init
    console.log("Initializing multipart upload...");
    const initRes = await fetch(`${WORKER_URL}/${KEY}?action=mp-init`, { method: "POST" });
    if (!initRes.ok) throw new Error(await initRes.text());
    const { uploadId } = await initRes.json();
    console.log(`Upload ID: ${uploadId}`);

    // 2. Upload Parts
    const parts = [];
    const buffer = fs.readFileSync(FILE_PATH);
    const totalParts = Math.ceil(fileSize / CHUNK_SIZE);

    for (let i = 0; i < totalParts; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileSize);
        const chunk = buffer.subarray(start, end);
        const partNumber = i + 1;

        console.log(`Uploading part ${partNumber}/${totalParts} (${chunk.length} bytes)...`);
        const partRes = await fetch(`${WORKER_URL}/${KEY}?action=mp-part&uploadId=${uploadId}&partNumber=${partNumber}`, {
            method: "PUT",
            body: chunk,
        });
        if (!partRes.ok) throw new Error(await partRes.text());
        const partData = await partRes.json();
        parts.push(partData);
    }

    // 3. Complete
    console.log("Completing upload...");
    const completeRes = await fetch(`${WORKER_URL}/${KEY}?action=mp-complete&uploadId=${uploadId}`, {
        method: "POST",
        body: JSON.stringify(parts),
        headers: { "Content-Type": "application/json" },
    });
    if (!completeRes.ok) throw new Error(await completeRes.text());
    console.log("Upload completed successfully!");
}

upload().catch(console.error);
