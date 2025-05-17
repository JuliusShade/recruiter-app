const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.post('/generate-presigned-url', (req, res) => {
  const { userId, candidateId, fileName, fileType } = req.body;
  // New path structure: users/{userId}/candidates/{candidateId}/{fileType}/{timestamp}_{fileName}
  const key = `users/${userId}/candidates/${candidateId}/${fileType}/${Date.now()}_${fileName}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    Expires: 60 * 5, // 5 minutes
  };
  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ url, key });
  });
});

router.get('/get-download-url/:key', (req, res) => {
  const { key } = req.params;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: 60 * 5, // 5 minutes
  };
  s3.getSignedUrl('getObject', params, (err, url) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ url });
  });
});

module.exports = router;
