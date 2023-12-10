import multiparty from "multiparty";
import { Client } from "minio";
import fs from "fs";
import mime from "mime";
import { mongooseConnect } from "@/lib/mongoose";

const bucketName = "books-bucket";
const links = [];

export default async function handle(req, res) {
  await mongooseConnect();
  const form = new multiparty.Form();
  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Error parsing form: ", err);
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });
    if (!files.file) {
      console.log("No files received");
      return res.status(400).json({ error: "No files received" });
    }
    const minioClient = new Client({
      endPoint: "localhost",
      port: 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_ACCESS_KEY,
    });

    if (minioClient) {
      console.log("Minio connected successfully!");
    }

    const filesArray = Array.isArray(files.file) ? files.file : [files.file];
    for (const file of filesArray) {
      const ext = file.originalFilename.split(".").pop();
      const newFileName = `${file.fieldName}-${Date.now()}.${ext}`;
      const fileStream = fs.createReadStream(file.path);
      const fileMimeType = mime.getType(file.path);
      await new Promise((resolve, reject) => {
        minioClient.putObject(
          bucketName,
          newFileName,
          fileStream,
          {
            "Content-Type": fileMimeType,
          },
          function (err, etag) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              console.log("File uploaded successfully. Etag:", etag);
              const link = `http://localhost:9000/${bucketName}/${newFileName}`;
              console.log("File link:", link);
              links.push(link);
              resolve(etag);
            }
          }
        );
      });
    }
    return res.json({ links });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        error: "An error occurred while processing the request.",
        more: err,
      });
  }
}
export const config = { api: { bodyParser: false } };
