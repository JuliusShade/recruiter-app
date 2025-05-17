const express = require("express");
const router = express.Router();
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

console.log('S3 route initialized with positions and candidates path structure');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post("/positions/generate-presigned-url", async (req, res) => {
  try {
    console.log("=== S3 Route Handler (Positions) ===");
    console.log("Received request for presigned URL:", req.body);
    const { userId, positionId, fileName, fileType } = req.body;

    if (!positionId) {
      throw new Error("Position ID is required for file upload");
    }

    // Create a unique key for the file with positions path at the same level as candidates
    const key = `users/${userId}/positions/${positionId}/${fileType}/${Date.now()}_${fileName}`;
    console.log("Generated S3 key:", key);
    console.log("Using bucket:", process.env.S3_BUCKET_NAME);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("Generated presigned URL:", url);
    console.log("=== End S3 Route Handler (Positions) ===");

    res.json({ url, key });
  } catch (error) {
    console.error("Error in S3 route:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// New Candidates route
router.post("/candidates/generate-presigned-url", async (req, res) => {
  try {
    console.log("=== S3 Route Handler (Candidates) ===");
    console.log("Received request for presigned URL:", req.body);
    const { userId, candidateId, fileName, fileType } = req.body;

    if (!candidateId) {
      throw new Error("Candidate ID is required for file upload");
    }

    // Create a unique key for the file with candidates path
    const key = `users/${userId}/candidates/${candidateId}/${fileType}/${Date.now()}_${fileName}`;
    console.log("Generated S3 key:", key);
    console.log("Using bucket:", process.env.S3_BUCKET_NAME);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("Generated presigned URL:", url);
    console.log("=== End S3 Route Handler (Candidates) ===");

    res.json({ url, key });
  } catch (error) {
    console.error("Error in S3 route:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// Delete file route for both candidates and positions
router.post("/candidates/delete-file", async (req, res) => {
  try {
    console.log("=== S3 Delete File Handler ===");
    const { fileKey } = req.body;

    if (!fileKey) {
      throw new Error("File key is required for deletion");
    }

    console.log("Deleting file with key:", fileKey);

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    console.log("File deleted successfully");
    console.log("=== End S3 Delete File Handler ===");

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

module.exports = router;
