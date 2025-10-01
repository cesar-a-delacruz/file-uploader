const router = require("express").Router();
const controller = require("../controllers/folderController");

router.get("/", controller.index);
router.get("/new", controller.new);
router.get("/edit/:name", controller.edit);
router.post("/create", controller.create);
router.post("/update/", controller.update);
router.post("/delete/", controller.delete);

module.exports = router;
