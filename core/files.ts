import { NextFunction, Request, Response } from 'express';
import multer, { Field, MulterError } from 'multer';
import path from 'path';
import { sendErrorResponse } from './utils';

export function multerSingleHandler(keyName: string, folderPath: string, mimeTypes: string[]) {
  const imageStorage = multer.diskStorage({
    // Destination to store image
    destination: folderPath,
    filename: (req, file, cb) => {
      const fileName = file.fieldname + '_' + Date.now() + path.extname(file.originalname);
      req.body[keyName] = `${folderPath}/${fileName}`;
      cb(null, fileName);
    },
  });
  const imageUpload = multer({
    storage: imageStorage,
    limits: {
      fileSize: 1000000, // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
      if (mimeTypes.includes(file.mimetype)) {
        // Check if file is an image , you can change the condition
        // upload only png and jpg format
        return cb(null, true);
      } else cb(new (MulterError as any)('INVALID_FILE', keyName));
    },
  });
  const upload = imageUpload.single(keyName);
  return (req: Request, res: Response, next: NextFunction) => {
    return upload(req, res, (err) => {
      if (err) {
        if (err instanceof MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return sendErrorResponse(400, 'File size cannot exceed 1 Mb', res);
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return sendErrorResponse(400, 'Field must be ' + keyName, res);
          }
          if ((err as any).code === 'INVALID_FILE') {
            return sendErrorResponse(400, 'Please upload ' + mimeTypes.toString().toUpperCase() + ' files', res);
          }
        }
      } else {
        next();
      }
    });
  };
}

export function multerMultiFieldHandler(keyNames: Field[], folderPath: string, mimeTypes: string[]) {
  const imageStorage = multer.diskStorage({
    // Destination to store image
    destination: folderPath,
    filename: (req, file, cb) => {
      const fileName = file.fieldname + '_' + Date.now() + path.extname(file.originalname);

      req.body[file.fieldname] = `${folderPath}/${fileName}`;

      cb(null, fileName);
    },
  });
  const imageUpload = multer({
    storage: imageStorage,
    limits: { fieldSize: 25 * 1024 * 1024 },
    fileFilter(req, file, cb) {
      if (mimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else cb(new (MulterError as any)('INVALID_FILE', keyNames));
    },
  });
  const upload = imageUpload.fields(keyNames);

  return (req: Request, res: Response, next: NextFunction) => {
    return upload(req, res, (err) => {
      if (err) {
        if (err instanceof MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return sendErrorResponse(400, 'File size cannot exceed 1 Mb', res);
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return sendErrorResponse(400, 'File must be ' + mimeTypes, res);
          }
          if ((err as any).code === 'INVALID_FILE') {
            return sendErrorResponse(400, 'Please upload ' + mimeTypes.toString().toUpperCase() + ' files', res);
          }
        }
        console.log(err);
        return sendErrorResponse(500, 'Internal Server Error', res)

      } else {
        next();
      }
    });
  };
}
