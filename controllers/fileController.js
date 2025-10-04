const { PrismaClient } = require("../generated/prisma");
const { validationResult } = require("express-validator");
const validator = require("../validators/fileValidator");
const model = new PrismaClient().file;
const folderModel = new PrismaClient().folder;
const fs = require("fs");
const upload = require("../middlewares/files");

module.exports = {
  async index(req, res) {
    const folderId = Number(req.params.folderId);
    const files = await model.findMany({
      where: { userId: req.user.id, folderId },
    });
    const folderName = (
      await folderModel.findFirst({ where: { id: folderId } })
    ).name;
    res.status(200).render("file/index", { title: folderName, files });
  },
  async new(req, res) {
    const folderId = (
      await folderModel.findFirst({
        where: { userId: req.user.id, name: req.query.folderName },
      })
    ).id;
    res.status(200).render("file/new", { title: "New File", folderId });
  },
  async show(req, res) {
    const file = await model.findFirst({
      where: { userId: req.user.id, id: Number(req.params.fileId) },
    });
    file.uploadTime = file.uploadTime.toLocaleString();
    res
      .status(200)
      .render("file/show", { title: file.name, file, folder: file.folderId });
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
        data: { name: name + req.ext, size, userId, folderId: Number(folder) },
      });
      res.redirect(`/file/${folder}/index`);
    },
  ],
  delete: async (req, res) => {
    const file = await model.delete({
      where: { userId: req.user.id, id: Number(req.body.id) },
    });
    const folderName = (
      await folderModel.findFirst({
        where: { userId: req.user.id, id: file.folderId },
      })
    ).name;

    fs.rm(`uploads/${req.user.id}/${folderName}/${file.name}`, (err) => {
      if (err) console.error(err);
    });
    res.redirect(`/file/${file.folderId}/index`);
  },
  download: async (req, res) => {
    const folderName = (
      await folderModel.findFirst({
        where: { userId: req.user.id, id: Number(req.body.folder) },
      })
    ).name;
    res.download(
      `uploads/${req.user.id}/${folderName}/${req.params.fileName}`,
      (err) => {
        if (err) console.error(err);
      },
    );
  },
};
