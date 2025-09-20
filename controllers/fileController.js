const { PrismaClient } = require("../generated/prisma");
const { validationResult } = require("express-validator");
const validator = require("../validators/fileValidator");
const model = new PrismaClient().file;
const path = require("path");
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: "public/",
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      const name = req.body.name;
      cb(null, name + extension);
    },
  }),
});

module.exports = {
  new(req, res) {
    res.status(200).render("file/new", { title: "Upload" });
  },
  create: [
    upload.single("file"),
    validator,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(errors.array());

      const { name } = req.body;
      const size = Number((req.file.size / 1000000).toFixed(2));
      console.log(name, size);
      await model.create({ data: { name, size } });
      res.redirect("/file/index");
    },
  ],
};
