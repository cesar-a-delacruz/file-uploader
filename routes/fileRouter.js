const router = require("express").Router();
const controller = require("../controllers/fileController");

router.get("/:folderName/index", controller.index);
router.get("/new", controller.new);
router.post("/create", controller.create);

module.exports = router;
