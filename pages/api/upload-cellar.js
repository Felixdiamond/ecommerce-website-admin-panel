import multiparty from "multiparty";
import AWS from "aws-sdk";
import fs from "fs";
import mime from "mime";
import { mongooseConnect } from "@/lib/mongoose";

const bucketName = "ninebooks";
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

    const s3 = new AWS.S3({
      accessKeyId: process.env.CELLAR_ADDON_KEY_ID,
      secretAccessKey: process.env.CELLAR_ADDON_KEY_SECRET,
      endpoint: new AWS.Endpoint('cellar-c2.services.clever-cloud.com'),
    });

    const filesArray = Array.isArray(files.file) ? files.file : [files.file];
    for (const file of filesArray) {
      const ext = file.originalFilename.split(".").pop();
      const newFileName = `${file.fieldName}-${Date.now()}.${ext}`;
      const fileStream = fs.createReadStream(file.path);
      const fileMimeType = mime.getType(file.path);

      const params = {
        Bucket: bucketName,
        Key: newFileName,
        Body: fileStream,
        ContentType: fileMimeType,
        ACL: 'public-read'
      };

      await s3.upload(params).promise()
        .then(data => {
          console.log("File uploaded successfully. Etag:", data.ETag);
          const link = data.Location;
          console.log("File link:", link);
          links.push(link);
        })
        .catch(err => {
          console.log(err);
          throw err;
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
