const router = require("express").Router();
const filter = require("../middlewares/filter");
const controller = require("../controllers/fileController");

router.get("/:folderId/index", [filter, controller.index]);
router.get("/new", [filter, controller.new]);
router.get("/show/:fileId", [filter, controller.show]);
router.post("/create", [filter, controller.create]);
router.post("/delete", [filter, controller.delete]);
router.post("/download/:fileName", [filter, controller.download]);

module.exports = router;
