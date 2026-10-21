import { Router } from 'express';
import multer from 'multer';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { assertMember } from '../services/conversationService.js';
import { userCanAccessAttachment } from '../services/attachmentService.js';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
]);

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await mkdir(env.uploadDir, { recursive: true });
    cb(null, env.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 12);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error('INVALID_FILE_TYPE'));
      return;
    }
    cb(null, true);
  },
});

const router = Router();
router.use(requireAuth);

router.post('/', upload.single('file'), async (req: AuthedRequest, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'File is required');
    }
    const conversationId =
      typeof req.body.conversationId === 'string' ? req.body.conversationId : undefined;
    if (conversationId) {
      await assertMember(conversationId, req.user!.id);
    }
    const attachment = await prisma.attachment.create({
      data: {
        uploaderId: req.user!.id,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        storageKey: req.file.filename,
      },
    });
    res.status(201).json({ attachment });
  } catch (error) {
    next(error);
  }
});

router.get('/:attachmentId', async (req: AuthedRequest, res, next) => {
  try {
    const attachmentId = String(req.params.attachmentId);
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) {
      throw new AppError(404, 'Attachment not found');
    }
    const allowed = await userCanAccessAttachment(req.user!.id, attachmentId);
    if (!allowed) {
      throw new AppError(403, 'Not authorized to download this attachment', 'FORBIDDEN');
    }
    const filePath = path.join(env.uploadDir, attachment.storageKey);
    if (!existsSync(filePath)) {
      throw new AppError(404, 'File missing on server');
    }
    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.filename}"`);
    createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
});

export { router as attachmentsRouter };
