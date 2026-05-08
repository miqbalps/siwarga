import { S3Client } from "@aws-sdk/client-s3";

const awsConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "placeholder",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "placeholder",
  },
};

export const s3 = new S3Client(awsConfig);
export const bucketName = process.env.AWS_S3_BUCKET_NAME || "siwarga-uploads";
export const cloudFrontUrl = process.env.CLOUDFRONT_URL;
