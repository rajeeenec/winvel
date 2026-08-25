import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(uploadsDir));

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Upload Endpoint: Accepts any single file upload
app.post('/upload', upload.any(), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const file = req.files[0];

    // Insert metadata into the database
    const [insertId] = await db('files').insert({
      filename: file.filename,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
    });

    const fileUrl = `/uploads/${file.filename}`;

    return res.status(201).json({
      success: true,
      data: {
        id: insertId,
        filename: file.filename,
        originalName: file.originalname,
        url: fileUrl,
      }
    });
  } catch (err) {
    next(err);
  }
});

// File Details Endpoint: Get details of a file by ID
app.get('/files/:id', async (req, res, next) => {
  try {
    const file = await db('files').where({ id: req.params.id }).first();
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    return res.json({
      success: true,
      data: {
        id: file.id,
        filename: file.filename,
        originalName: file.original_name,
        mimeType: file.mime_type,
        size: file.size,
        url: `/uploads/${file.filename}`,
      }
    });
  } catch (err) {
    next(err);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('File Service Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export default app;
