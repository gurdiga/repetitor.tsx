import React = require("react");
import {runScenario} from "frontend/shared/src/ScenarioRunner";
import {UPLOADED_FILES_FORM_FIELD_NAME} from "shared/src/Model/UploadedFile";

export function AvatarUploadButton() {
  return (
    <>
      <input type="file" onChange={maybeUploadFile} />
    </>
  );

  async function maybeUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const {files} = event.target;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const uploadForm = new FormData();

    uploadForm.append(UPLOADED_FILES_FORM_FIELD_NAME, file);

    const response = await runScenario("AvatarUpload", {}, uploadForm);

    // const response = await fetch("/upload", {
    //   method: "POST",
    //   body: formData,
    //   redirect: "error",
    //   cache: "no-store",
    // });

    // if (response.status !== 200) {
    //   return {failed: true}; // TODO
    // }

    // return await response.json();
  }
}
