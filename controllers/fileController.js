const { PrismaClient } = require("../generated/prisma");
const { validationResult } = require("express-validator");
const validator = require("../validators/fileValidator");
const model = new PrismaClient().file;
const folderModel = new PrismaClient().folder;
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = `uploads/${req.user.id}/${req.body.folder}`;
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
  async index(req, res) {
    const files = await model.findMany({
      where: { userId: req.user.id, folder: { name: req.params.folderName } },
    });
    res
      .status(200)
      .render("file/index", { title: req.params.folderName, files });
  },
  async new(req, res) {
    const folderId = (
      await folderModel.findFirst({
        where: { userId: req.user.id, name: req.query.folderName },
      })
    ).id;
    res.status(200).render("file/new", { title: "New File", folderId });
  },
  create: [
    upload.single("file"),
    validator,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        fs.rm(req.file.path, (err) => {
          if (err) console.error(err);
        });
        return res.status(400).json(errors.array());
      }
      if (!req.user) return res.status(400).json("log in");

      const { name, folder } = req.body;
      const size = Number((req.file.size / 1000000).toFixed(2));
      const userId = req.user.id;
      await model.create({
        data: { name, size, userId, folderId: Number(folder) },
      });
      res.redirect(`/file/${folder}/index`);
    },
  ],
};
