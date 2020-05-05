import React = require("react");
import {UPLOADED_FILES_FORM_FIELD_NAME} from "shared/src/Model/UploadedFile";

export function AvatarUploadButton() {
  return (
    <form>
      &lt;AvatarUploadButton /&gt;
      <br />
      <input type="file" onChange={handleChange} />
    </form>
  );

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const {files} = event.target;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const formData = new FormData();

    formData.append(UPLOADED_FILES_FORM_FIELD_NAME, file);

    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
      redirect: "error",
      cache: "no-store",
    });

    if (response.status !== 200) {
      return {failed: true}; // TODO
    }

    // TODO: consider using runScenario()

    return await response.json();
  }
}
