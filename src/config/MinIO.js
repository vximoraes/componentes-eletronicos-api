import * as Minio from 'minio'
import dotenv from 'dotenv'

dotenv.config()

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
})

// Define policy pública
            const policy = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: { AWS: ["*"] },
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${process.env.MINIO_BUCKET}/*`]
                    }
                ]
            };

if( ! (await minioClient.bucketExists(process.env.MINIO_BUCKET))) {
    await minioClient.makeBucket(process.env.MINIO_BUCKET, 'us-east-1');
}
await minioClient.setBucketPolicy(process.env.MINIO_BUCKET, JSON.stringify(policy));
console.log('Bucket criado:', process.env.MINIO_BUCKET)
export default minioClient;