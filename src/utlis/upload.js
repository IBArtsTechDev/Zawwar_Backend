import multer from "multer";
import path from "path";

// Function to generate a unique, compact, and precise filename
const generateUniqueFilename = (originalName) => {
    const ext = path.extname(originalName).toLowerCase(); // Ensure extension is lowercase
    const timestamp = Date.now().toString(36); // Convert milliseconds timestamp to Base36
    const randomStr = Math.random().toString(36).substr(2, 5); // Generate a 5-character random string
    return `${timestamp}-${randomStr}${ext}`;
};

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        const uniqueFilename = generateUniqueFilename(file.originalname);
        cb(null, uniqueFilename);
    }
});

// File filter to accept only specific file types (optional but recommended)
const fileFilter = (req, file, cb) => {
    // Define acceptable file extensions
    // Updated allowedExtensions to include video formats
    const allowedExtensions = /jpeg|jpg|png|gif|svg|mp4|mov|avi|mkv|wmv|flv|webm/;    
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type!'), false);
    }
};

// Initialize multer with storage and file filter
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB (adjust as needed)
});

export default upload;;
