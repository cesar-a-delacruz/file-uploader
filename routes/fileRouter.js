const router = require("express").Router();
const controller = require("../controllers/fileController");

router.get("/:folderId/index", controller.index);
router.get("/new", controller.new);
router.get("/show/:fileId", controller.show);
router.post("/create", controller.create);
router.post("/delete", controller.delete);
router.post("/download/:fileName", controller.download);

module.exports = router;
