const { Storage } = require("@google-cloud/storage");
const path = require("path");

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,

  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT),
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);

exports.uploadFile = async (file, businessId, draftJobCardNo) => {
  const fileName = `fabric/${businessId}/${draftJobCardNo}/${Date.now()}_${file.originalname}`;

  const blob = bucket.file(fileName);

  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", reject);

    blobStream.on("finish", async () => {
      try {
        // SIGNED URL
        const [signedUrl] = await blob.getSignedUrl({
          action: "read",

          expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
        });

        resolve(signedUrl);
      } catch (err) {
        reject(err);
      }
    });

    blobStream.end(file.buffer);
  });
};
