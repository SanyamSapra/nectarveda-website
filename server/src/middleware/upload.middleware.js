import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from "multer";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'nectarveda/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
export default upload