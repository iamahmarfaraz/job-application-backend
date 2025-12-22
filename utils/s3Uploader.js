const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");

async function uploadFileToS3(fileBuffer, fileName, mimeType){
    try {
        
        const key = `${uuidv4()}-${fileName}`;

        const uploadParams = {
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
            // ACL: "public-read" //so file is accessible via UrL
        };

        await s3.send(new PutObjectCommand(uploadParams));

        return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    } catch (error) {
        console.error("S3 Upload Error : ",error);
        throw error;
    }
}

module.exports = uploadFileToS3;