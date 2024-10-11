import express from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_S3_BUCKET;

// Test-Route für S3-Berechtigungen
router.get('/test-s3', async (req, res) => {
  const testFileName = `${uuidv4()}.txt`;
  const testFileContent = 'This is a test file for S3 bucket permissions.';

  try {
    // 1. Datei hochladen
    const putParams = {
      Bucket: bucketName,
      Key: testFileName,
      Body: testFileContent,
      ContentType: 'text/plain',
    };

    await s3Client.send(new PutObjectCommand(putParams));
    console.log('Datei erfolgreich hochgeladen.');

    // 2. Datei abrufen
    const getParams = {
      Bucket: bucketName,
      Key: testFileName,
    };

    const { Body } = await s3Client.send(new GetObjectCommand(getParams));
    const data = await streamToString(Body);
    console.log('Datei erfolgreich abgerufen:', data);

    // 3. Datei löschen
    const deleteParams = {
      Bucket: bucketName,
      Key: testFileName,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log('Datei erfolgreich gelöscht.');

    res.json({
      message: 'S3-Zugriff erfolgreich getestet.',
      uploadedContent: data,
    });
  } catch (error) {
    console.error('Fehler beim Zugriff auf S3:', error);
    res.status(500).json({ error: 'Fehler beim Zugriff auf S3', details: error.message });
  }
});

// Hilfsfunktion zum Lesen des Streams
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

export default router;
