// Import required modules
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000; // Use environment PORT or default to 3000

// Define directories
const UPLOAD_DIR = path.join(__dirname, 'uploads'); // For storing uploaded files
const PUBLIC_DIR = path.join(__dirname, 'public'); // For serving static assets like index.html

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Middleware
app.use(express.static(PUBLIC_DIR)); // Serve static files (e.g., index.html)
app.use('/uploads', express.static(UPLOAD_DIR)); // Serve uploaded photos
app.use(express.json()); // Parse JSON requests
const cors = require('cors');
app.use(cors()); // Allow cross-origin requests

// Route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Route to handle photo uploads
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ message: 'Photo uploaded successfully!', path: `/uploads/${req.file.filename}` });
});

// Route to fetch all uploaded photos
app.get('/photos', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error loading photos' });
    }
    const photoUrls = files.map(file => `/uploads/${file}`);
    res.json(photoUrls);
  });
});

// Route to delete a specific photo
app.delete('/photos/:filename', (req, res) => {
  const filename = req.params.filename; // Get the filename from the URL
  const filePath = path.join(UPLOAD_DIR, filename); // Full path to the file

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filename}`);
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${filename}`, err);
        return res.status(500).json({ error: 'Failed to delete file' });
      }

      console.log(`File deleted: ${filename}`);
      res.status(200).json({ message: 'File deleted successfully' });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
