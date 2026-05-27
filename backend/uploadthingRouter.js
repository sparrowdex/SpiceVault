const { createUploadthing } = require("uploadthing/express");
const f = createUploadthing();

const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete((data) => {
    console.log("Upload complete for url:", data.file.url);
  }),
};

module.exports = { uploadRouter };