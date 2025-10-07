const router = require("express").Router();
const filter = require("../middlewares/filter");
const controller = require("../controllers/folderController");

router.get("/", [filter, controller.index]);
router.get("/new", [filter, controller.new]);
router.get("/edit/:folderId", [filter, controller.edit]);
router.post("/create", [filter, controller.create]);
router.post("/update/", [filter, controller.update]);
router.post("/delete/", [filter, controller.delete]);

module.exports = router;
