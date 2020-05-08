import {Request} from "express";
import * as multer from "multer";
import {
  MAX_UPLOADED_FILE_COUNT,
  MAX_UPLOADED_FILE_SIZE,
  UploadedFile,
  UPLOADED_FILES_FORM_FIELD_NAME,
} from "shared/src/Model/FileUpload";

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

export const uploadParser = upload.array(UPLOADED_FILES_FORM_FIELD_NAME, MAX_UPLOADED_FILE_COUNT);

export function uploadedFilesFromRequest(req: Request): UploadedFile[] {
  if (req.files instanceof Array) {
    return req.files;
  } else {
    return req.files ? req.files[UPLOADED_FILES_FORM_FIELD_NAME] : [];
  }
}
