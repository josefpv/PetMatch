const AWS = require("aws-sdk");

// Configurar AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

function createPresignUrl(fileName, fileType) {
  console.log(process.env.AWS_S3_BUCKET_NAME);
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Expires: 300, // URL válida por 5 minutos (esta en segundos)
    ContentType: fileType,
    ACL: "public-read", // Access Control, definicion de nivle de acceso
  };

  return s3.getSignedUrlPromise("putObject", params);
}

module.exports = { createPresignUrl };
