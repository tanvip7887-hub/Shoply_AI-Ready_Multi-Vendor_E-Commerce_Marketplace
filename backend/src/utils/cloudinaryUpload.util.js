import cloudinary from "../config/cloudinary.js";

/**
 * Uploads a file buffer (from multer's memory storage) to Cloudinary
 * using an upload stream — avoids writing temp files to disk first.
 */
export const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        quality: "auto",
        fetch_format: "auto"
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};