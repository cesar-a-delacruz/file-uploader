const router = require("express").Router();
const controller = require("../controllers/userController");

router.get("/new", controller.new);
router.post("/create", controller.create);

module.exports = router;
