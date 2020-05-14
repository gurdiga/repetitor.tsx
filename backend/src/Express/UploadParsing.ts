import * as express from "express";
import * as multer from "multer";
import {
  MAX_UPLOADED_FILE_COUNT,
  MAX_UPLOADED_FILE_SIZE,
  UPLOADED_FILES_FORM_FIELD_NAME,
  UploadParsingResult,
  UploadValidationError,
} from "shared/src/Model/FileUpload";

// Docs: https://www.npmjs.com/package/multer
const upload = multer({
  dest: "uploads/",
  limits: {
    fields: 3, // scenarioName, scenarioInput, and _csfrf
    fieldNameSize: 30,
    fieldSize: 10 * 1024,
    files: MAX_UPLOADED_FILE_COUNT, // the max number of file fields; I’ll increase when needed
    fileSize: MAX_UPLOADED_FILE_SIZE,
  },
});

interface ExtendedRequest extends express.Request {
  uploadValidationError?: UploadValidationError;
}

export const uploadParser = (req: ExtendedRequest, res: express.Response, next: express.NextFunction) => {
  const multerUploadParser = upload.array(UPLOADED_FILES_FORM_FIELD_NAME, MAX_UPLOADED_FILE_COUNT);

  multerUploadParser(req, res, (error: any) => {
    if (error instanceof multer.MulterError) {
      // I chose not to pass the error to next() because then Express picks it up
      // and aborts the middleware chain, and so it doesn’t reach the scenario handler.
      req.uploadValidationError = getUploadValidationError(error);
      error = undefined;
    }

    next(error);
  });
};

function getUploadValidationError(error: multer.MulterError): UploadValidationError {
  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      return {kind: "FileTooLargeError"};
    case "LIMIT_FILE_COUNT":
    case "LIMIT_PART_COUNT":
    case "LIMIT_FIELD_KEY":
    case "LIMIT_FIELD_VALUE":
    case "LIMIT_FIELD_COUNT":
    case "LIMIT_UNEXPECTED_FILE":
      return {kind: "UnacceptableUploadError", error: error.message};
  }
}

export function getUploadParsingResult(req: ExtendedRequest): UploadParsingResult {
  if (req.uploadValidationError) {
    return req.uploadValidationError;
  }

  if (!req.files) {
    return [];
  }

  if (req.files instanceof Array) {
    return req.files;
  } else {
    return req.files[UPLOADED_FILES_FORM_FIELD_NAME];
  }
}
