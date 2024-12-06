// Import required modules
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000; // Use the environment PORT or default to 3000

// Define the directory to store uploaded files
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Middleware to serve static files (uploaded photos)
app.use(express.static(UPLOAD_DIR));

// Allow requests from any origin (CORS)
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Route to serve the index.html file at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to upload a photo
app.post('/upload', upload.single('photo'), (req, res) => {
  console.log('File upload request received.');
  if (!req.file) {
    console.error('No file uploaded.');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('File uploaded successfully:', req.file);
  res.status(200).json({ message: 'Photo uploaded successfully!', path: req.file.filename });
});

// Route to get all uploaded photos
app.get('/photos', (req, res) => {
  console.log('Fetching all photos...');
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      console.error('Error reading upload directory:', err);
      return res.status(500).json({ error: 'Error loading photos' });
    }

    console.log('Files in directory:', files);
    const photoUrls = files.map(file => `/${file}`);
    res.json(photoUrls);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
