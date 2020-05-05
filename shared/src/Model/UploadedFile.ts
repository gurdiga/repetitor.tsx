export const UPLOADED_FILES_FORM_FIELD_NAME = "files";

export interface UploadedFile {
  originalname: string;
  path: string;
  mimetype: string;
  size: number;
}
