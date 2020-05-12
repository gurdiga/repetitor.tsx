import {getUploadedFileUrl, uploadFile} from "backend/src/FileStorage";
import {AvatarUrl, makeImageFromUploadedFiles} from "shared/src/Model/AvatarUpload";
import {
  CloudUploadError,
  CloudUploadVerificationError,
  UploadedFile,
  UploadSourceFileMissingErrorr,
} from "shared/src/Model/FileUpload";
import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import path = require("path");

type Scenario = ScenarioRegistry["AvatarUpload"];

export async function AvatarUpload(
  _input: Scenario["Input"],
  session: UserSession,
  uploadedFiles: UploadedFile[]
): Promise<Scenario["Result"]> {
  if (!session.userId) {
    return {
      kind: "NotAuthenticatedError",
    };
  }

  const makeImageResult = makeImageFromUploadedFiles(uploadedFiles);

  if (makeImageResult.kind !== "AvatarImage") {
    return makeImageResult;
  }

  console.log({makeImageResult});

  return await uploadAvatar(makeImageResult.image, session.userId);
}

async function uploadAvatar(
  image: UploadedFile,
  userId: number
): Promise<AvatarUrl | UploadSourceFileMissingErrorr | CloudUploadError | CloudUploadVerificationError> {
  const fileExtension = path.extname(image.originalname);
  const destinationFileName = `avatar-${userId}${fileExtension}`;
  const uploadFileResult = await uploadFile(image.path, destinationFileName, image.mimetype);

  if (uploadFileResult.kind !== "UploadFileSuccess") {
    return uploadFileResult;
  }

  return {
    kind: "AvatarUrl",
    url: getUploadedFileUrl(destinationFileName),
  };
}
