import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { createMicroservice } from './createMicroservice.js';
import { logoUpload } from '../middleware/upload.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as uploadController from '../services/settings/upload.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.FILE_SERVICE_PORT || 4003;

const handleImageUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image file uploaded' });
  }
  const fileUrl = `/uploads/logos/${req.file.filename}`;
  res.json({
    success: true,
    data: {
      id: Date.now(),
      filename: req.file.filename,
      url: fileUrl,
    },
    url: fileUrl,
  });
};

const { app, start } = createMicroservice({
  serviceName: 'File Service',
  port: PORT,
  routes: (expressApp) => {
    // Serve static files from uploads folder
    expressApp.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

    // Direct logo upload endpoints
    expressApp.post(
      '/upload/logo',
      authenticate,
      requireRole('admin'),
      logoUpload.single('logo'),
      uploadController.uploadLogo
    );

    expressApp.post(
      '/api/settings/upload/logo',
      authenticate,
      requireRole('admin'),
      logoUpload.single('logo'),
      uploadController.uploadLogo
    );

    // General image/banner upload endpoints
    const uploadMiddleware = logoUpload.single('file');
    const uploadAnyMiddleware = (req, res, next) => {
      logoUpload.any()(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, error: err.message });
        if (req.files && req.files.length > 0) {
          req.file = req.files[0];
        }
        next();
      });
    };

    expressApp.post('/upload', authenticate, uploadAnyMiddleware, handleImageUpload);
    expressApp.post('/api/upload', authenticate, uploadAnyMiddleware, handleImageUpload);
    expressApp.post('/upload/image', authenticate, uploadAnyMiddleware, handleImageUpload);
    expressApp.post('/api/upload/image', authenticate, uploadAnyMiddleware, handleImageUpload);
  },
});

export { app };

if (process.argv[1] && process.argv[1].endsWith('file.service.js')) {
  start();
}
