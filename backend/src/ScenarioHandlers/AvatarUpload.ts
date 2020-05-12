import {deleteTemFile, uploadFile} from "backend/src/FileStorage";
import {makeImageFromUploadedFiles} from "shared/src/Model/AvatarUpload";
import {UploadedFile} from "shared/src/Model/FileUpload";
import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import path = require("path");
import fs = require("fs");

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

  const {image} = makeImageResult;
  const fileExtension = path.extname(image.originalname);
  const destinationFileName = `avatar-${session.userId}${fileExtension}`;
  const uploadFileResult = await uploadFile(image.path, destinationFileName, image.mimetype);

  if (uploadFileResult.kind !== "UploadFileSuccess") {
    return uploadFileResult;
  }

  deleteTemFile(image.path);

  return {
    kind: "AvatarUrl",
    url: uploadFileResult.url,
  };
}
