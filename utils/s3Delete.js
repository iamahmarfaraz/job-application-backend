const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");
require("dotenv").config();

async function deleteFileFromS3(urlOrKey) {
    if(!urlOrKey)return false;

    const bucket = process.env.S3_BUCKET;
    let key;

    // if valuee is url then parse and extracr only if belongs to our bucket
    try {
        const url = new URL(urlOrKey);

        if(!url.hostname.includes(`${bucket}`) && !url.hostname.includes(`s3.${process.env.AWS_REGION}`)){
            // NOT our bcket
            return false;
        }

        key = url.pathname.replace(/^\/+/,""); 

    } catch (error) {
        // not a url , treat as key
        key = String(urlOrKey);
    }

    if(!key)return false;

    try {
        await s3.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        }));
        return true;
    } catch (error) {
        console.warn("S3 Delete failed for key: ", key, error?.message || error);
        throw error;
    }
}

module.exports = deleteFileFromS3;