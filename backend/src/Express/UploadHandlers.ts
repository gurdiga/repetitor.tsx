import {handlePost} from "backend/src/Express/Adapter";
import * as express from "express";

export function handleAvatarUpload(req: express.Request, res: express.Response) {
  // TODO: Pass req to an upload parsing library to get req.files.

  handlePost(req, res);
}
