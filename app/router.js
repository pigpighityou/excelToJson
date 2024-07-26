/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app;
  router.get('/', controller.upload.upload);
  router.get("/upload", controller.home.upload);
  router.get("/upload-dir", controller.home.uploadDir);
  router.get("/upload-rules", controller.upload.upload);
  router.post("/upload-dir", controller.home.uploadDirPost);
  router.post("/upload", controller.home.uploadPost);
  router.post("/download-json-zip", controller.home.compressAndDownload);
};
