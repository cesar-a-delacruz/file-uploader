const { PrismaClient } = require("../generated/prisma");
const { validationResult } = require("express-validator");
const validator = require("../validators/fileValidator");
const model = new PrismaClient().file;
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = `uploads/${req.user.id}`;
      fs.readdir(uploadPath, (err) => {
        if (err) {
          fs.mkdir(uploadPath, (err) => {
            if (err) console.log(err);
            else cb(null, uploadPath);
          });
        } else cb(null, uploadPath);
      });
    },
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
      if (!req.user) return res.status(400).json("log in");

      const { name } = req.body;
      const size = Number((req.file.size / 1000000).toFixed(2));
      const userId = req.user.id;
      await model.create({ data: { name, size, userId } });
      res.redirect("/file/index");
    },
  ],
};
