import { Client } from "minio";

export default async function handle(req, res) {
  const imageUrl = req.query.url;

  // Parse the image URL to get the bucket name and object name
  const urlParts = imageUrl.split('/');
  const bucketName = urlParts[urlParts.length - 2];
  const objectName = urlParts[urlParts.length - 1];

  // Create a new Minio Client
  const minioClient = new Client({
    endPoint: "localhost",
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_ACCESS_KEY,
  });

  try {
    // Remove the object from Minio
    await minioClient.removeObject(bucketName, objectName);

    res.status(200).json({ message: 'Image removed successfully' });
  } catch (err) {
    console.error('Error removing image:', err);
    res.status(500).json({ error: 'An error occurred while removing the image' });
  }
}
