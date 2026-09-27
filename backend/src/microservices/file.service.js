import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { createMicroservice } from './createMicroservice.js';
import { logoUpload } from '../middleware/upload.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as uploadController from '../services/settings/upload.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.FILE_SERVICE_PORT || 4003;

const { app, start } = createMicroservice({
  serviceName: 'File Service',
  port: PORT,
  routes: (expressApp) => {
    // Serve static files from uploads folder
    expressApp.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

    // Direct upload endpoint
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

    expressApp.post(
      '/upload',
      authenticate,
      logoUpload.single('file'),
      (req, res) => {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileUrl = `http://localhost:${PORT}/uploads/logos/${req.file.filename}`;
        res.json({
          success: true,
          data: {
            id: Date.now(),
            filename: req.file.filename,
            url: fileUrl,
          },
        });
      }
    );
  },
});

export { app };

if (process.argv[1] && process.argv[1].endsWith('file.service.js')) {
  start();
}
