const { createUploadthing } = require("uploadthing/express");
const f = createUploadthing();

const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(({ metadata, file }) => {
    console.log("Upload complete! File URL:", file.url);
  }),
};

module.exports = { uploadRouter };