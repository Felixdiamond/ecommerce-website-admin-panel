import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export default async function handle(req, res) {
  const imageUrl = req.query.url;

  // Parse the image URL to get the bucket name and object name
  const urlParts = imageUrl.split('/');
  const bucketName = "ninebooks";
  const objectName = urlParts[urlParts.length - 1];

  // Create a new S3 Client
  const client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Remove the object from S3
    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    }));

    res.status(200).json({ message: 'Image removed successfully' });
  } catch (err) {
    console.error('Error removing image:', err);
    res.status(500).json({ error: 'An error occurred while removing the image' });
  }
}