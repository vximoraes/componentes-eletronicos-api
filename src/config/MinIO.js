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

minioClient.bucketExists(process.env.MINIO_BUCKET, (err, exists)=>{
    if(err) throw err;
    if(!exists) {
        minioClient.makeBucket(process.env.MINIO_BUCKET, 'us-east-1', err =>{
            if(err) throw err;
            console.log('Bucket criado:', process.env.MINIO_BUCKET)
        })
    }
});
export default minioClient;