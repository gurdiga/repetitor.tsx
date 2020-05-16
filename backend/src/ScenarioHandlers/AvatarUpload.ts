import {deleteTemFile, storeFile} from "backend/src/FileStorage";
import {makeImageFromUpload} from "shared/src/Model/AvatarUpload";
import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import path = require("path");
import fs = require("fs");

type Scenario = ScenarioRegistry["AvatarUpload"];

export async function AvatarUpload(input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  if (!session.userId) {
    return {
      kind: "NotAuthenticatedError",
    };
  }

  const makeImageResult = makeImageFromUpload(input.upload);

  if (makeImageResult.kind !== "AvatarImage") {
    return makeImageResult;
  }

  const {image} = makeImageResult;
  const fileExtension = path.extname(image.originalname).toLowerCase();
  const destinationFileName = `avatar-${session.userId}${fileExtension}`;
  const storeFileResult = await storeFile(image.path, destinationFileName, image.mimetype);

  if (storeFileResult.kind !== "StoreFileSuccess") {
    return storeFileResult;
  }

  deleteTemFile(image.path);

  return {
    kind: "AvatarUrl",
    url: storeFileResult.url,
  };
}
