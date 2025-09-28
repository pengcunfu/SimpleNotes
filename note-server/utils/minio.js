const Minio = require('minio');

// Initialize Minio client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'simplenotes-files';

// Initialize bucket
const initializeBucket = async () => {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket ${BUCKET_NAME} created successfully`);
      
      // Set bucket policy to allow public read for certain file types
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/public/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log('Bucket policy set successfully');
    } else {
      console.log(`Bucket ${BUCKET_NAME} already exists`);
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
  }
};

// Upload file to Minio
const uploadFile = async (file, folder = 'uploads') => {
  try {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const metaData = {
      'Content-Type': file.mimetype,
      'Content-Length': file.size,
    };

    await minioClient.putObject(BUCKET_NAME, fileName, file.buffer, file.size, metaData);
    
    // Generate file URL
    const fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${fileName}`;
    
    return {
      fileName,
      fileUrl,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  } catch (error) {
    console.error('Error uploading file to Minio:', error);
    throw new Error('File upload failed');
  }
};

// Delete file from Minio
const deleteFile = async (fileName) => {
  try {
    await minioClient.removeObject(BUCKET_NAME, fileName);
    console.log(`File ${fileName} deleted successfully`);
  } catch (error) {
    console.error('Error deleting file from Minio:', error);
    throw new Error('File deletion failed');
  }
};

// Get file download URL
const getFileUrl = async (fileName, expiry = 24 * 60 * 60) => {
  try {
    const url = await minioClient.presignedGetObject(BUCKET_NAME, fileName, expiry);
    return url;
  } catch (error) {
    console.error('Error generating file URL:', error);
    throw new Error('Failed to generate file URL');
  }
};

// Upload multiple files
const uploadMultipleFiles = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error('Multiple file upload failed');
  }
};

// Check if file exists
const fileExists = async (fileName) => {
  try {
    await minioClient.statObject(BUCKET_NAME, fileName);
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

// Get file info
const getFileInfo = async (fileName) => {
  try {
    const stat = await minioClient.statObject(BUCKET_NAME, fileName);
    return {
      size: stat.size,
      lastModified: stat.lastModified,
      etag: stat.etag,
      contentType: stat.metaData['content-type'],
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    throw new Error('Failed to get file info');
  }
};

module.exports = {
  minioClient,
  initializeBucket,
  uploadFile,
  deleteFile,
  getFileUrl,
  uploadMultipleFiles,
  fileExists,
  getFileInfo,
  BUCKET_NAME,
};
