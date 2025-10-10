const { PrismaClient } = require("../generated/prisma");
const { validationResult } = require("express-validator");
const validator = require("../validators/fileValidator");
const model = new PrismaClient().file;
const folderModel = new PrismaClient().folder;
const { Buffer } = require("buffer");
const { cloudinary, fileHandler } = require("../middlewares/files");

module.exports = {
  async index(req, res) {
    const folderId = Number(req.params.folderId);
    const files = await model.findMany({
      where: { userId: req.user.id, folderId },
    });
    const folderName = (
      await folderModel.findFirst({ where: { id: folderId } })
    ).name;
    res.status(200).render("file/index", {
      title: folderName,
      user: req.user,
      files,
      index: "/folder",
    });
  },
  async new(req, res) {
    const folderId = (
      await folderModel.findFirst({
        where: { userId: req.user.id, name: req.query.folderName },
      })
    ).id;
    res.status(200).render("file/new", {
      title: "New File",
      user: req.user,
      folderId,
      index: `/file/${folderId}/index`,
    });
  },
  async show(req, res) {
    const file = await model.findFirst({
      where: { userId: req.user.id, id: Number(req.params.fileId) },
    });
    file.uploadTime = file.uploadTime.toLocaleString();
    res.status(200).render("file/show", {
      title: file.name,
      user: req.user,
      file,
      folder: file.folderId,
      index: `/file/${file.folderId}/index`,
    });
  },
  create: [
    fileHandler,
    validator,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await cloudinary.uploader.destroy(req.public_id);
        return res.status(400).json(errors.array());
      }
      if (!req.user) return res.status(400).json("log in");

      const name = req.body.name;
      const folderId = Number(req.body.folder);
      const size = Number((req.file.size / 1000000).toFixed(2));
      const path =
        "https://res.cloudinary.com/dbjffqlow/image/upload/v1760113651/" +
        req.public_id;
      const userId = req.user.id;
      await model.create({
        data: { name, size, path, userId, folderId },
      });

      res.redirect(`/file/${folderId}/index`);
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

    await cloudinary.uploader.destroy(
      `file_uploader/${req.user.id}/${folderName}/${file.name}`,
    );
    res.redirect(`/file/${file.folderId}/index`);
  },
  download: async (req, res) => {
    const folderName = (
      await folderModel.findFirst({
        where: { userId: req.user.id, id: Number(req.body.folder) },
      })
    ).name;
    const publicId = `file_uploader/${req.user.id}/${folderName}/${req.params.fileName}`;
    const fileInfo = await cloudinary.api.resource(publicId);
    const fileUrl = await cloudinary.url(publicId, {
      resource_type: fileInfo.resource_type,
      format: fileInfo.format,
    });
    const fileRes = await fetch(fileUrl, { mode: "cors" });
    const fileBuff = Buffer.from(await fileRes.arrayBuffer());

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.params.fileName}.${fileInfo.format}"`,
    );
    res.send(fileBuff);
  },
};
