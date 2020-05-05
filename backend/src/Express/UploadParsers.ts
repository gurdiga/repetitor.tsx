import {Request} from "express";
import * as multer from "multer";
import {UploadedFile, UPLOADED_FILES_FORM_FIELD_NAME} from "shared/src/Model/UploadedFile";

const upload = multer({
  dest: "uploads/",
  limits: {
    fields: 2, // scenarioName & scenarioInput
    fieldNameSize: 30,
    fieldSize: 10 * 1024,
    files: 1, // the max number of file fields; I’ll increase when needed
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadParser = upload.array(UPLOADED_FILES_FORM_FIELD_NAME, 1);

export function uploadedFilesFromRequest(req: Request): UploadedFile[] {
  if (req.files instanceof Array) {
    return req.files as UploadedFile[];
  } else {
    return req.files[UPLOADED_FILES_FORM_FIELD_NAME] as UploadedFile[];
  }
}
