import {deleteStoredFile, deleteTemFile, storeFile} from "backend/src/FileStorage";
import {loadProfile, updateProfile} from "backend/src/Persistence/AccountPersistence";
import {getRandomString} from "backend/src/StringUtils";
import * as path from "path";
import {AvatarExists, makeImageFromUpload, NoAvatar} from "shared/src/Model/AvatarUpload";
import {ProfileNotFoundError} from "shared/src/Model/Profile";
import {UserSession} from "shared/src/Model/UserSession";
import {DbError, UnexpectedError} from "shared/src/Model/Utils";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";

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
  const cloudFileName = getCloudFileName(image.originalname, session.userId);
  const storeFileResult = await storeFile(image.path, cloudFileName, image.mimetype);

  deleteTemFile(image.path);

  if (storeFileResult.kind !== "StoreFileSuccess") {
    return storeFileResult;
  }

  const getOldAvatarResult = await getOldAvatarCloudFileName(session.userId);

  if (getOldAvatarResult.kind === "AvatarExists") {
    await deleteStoredFile(getOldAvatarResult.fileName);
  } else if (getOldAvatarResult.kind !== "NoAvatar") {
    return getOldAvatarResult;
  }

  const updateProfileResult = await updateProfile(session.userId, {avatarFilename: cloudFileName});

  if (updateProfileResult.kind !== "ProfileUpdated") {
    return updateProfileResult;
  }

  return {
    kind: "AvatarUrl",
    url: storeFileResult.url,
  };
}

function getCloudFileName(originalFileName: string, userId: number): string {
  const fileExtension = path.extname(originalFileName).toLowerCase();
  const uniqueToken = getRandomString(16);

  return `avatar-${userId}-${uniqueToken}${fileExtension}`;
}

async function getOldAvatarCloudFileName(
  userId: number
): Promise<AvatarExists | NoAvatar | ProfileNotFoundError | UnexpectedError | DbError> {
  const result = await loadProfile(userId);

  if (result.kind !== "ProfileLoaded") {
    return result;
  }

  if (!result.avatarFilename) {
    return {
      kind: "NoAvatar",
    };
  }

  return {
    kind: "AvatarExists",
    fileName: result.avatarFilename,
  };
}
