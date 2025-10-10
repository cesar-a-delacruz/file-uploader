const { PrismaClient } = require("../generated/prisma");
const { validationResult } = require("express-validator");
const validator = require("../validators/fileValidator");
const model = new PrismaClient().folder;
const { cloudinary } = require("../middlewares/files");

module.exports = {
  async index(req, res) {
    const folders = await model.findMany({ where: { userId: req.user.id } });
    res.status(200).render("folder/index", {
      title: "All Folders",
      user: req.user,
      folders,
    });
  },
  async new(req, res) {
    res.status(200).render("folder/new", {
      title: "New Folder",
      user: req.user,
      index: "/folder",
    });
  },
  async edit(req, res) {
    const userId = Number(req.user.id);
    const folder = await model.findFirst({
      where: { userId, id: Number(req.params.folderId) },
    });
    res.status(200).render("folder/edit", {
      title: "Edit Folder",
      user: req.user,
      folder,
      index: "/folder",
    });
  },
  create: [
    validator,
    async (req, res) => {
      const name = req.body.name;
      const userId = req.user.id;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await cloudinary.api.delete_folder(
          `file_uploader/${req.user.id}/${name}`,
        );
        return res.status(400).json(errors.array());
      }

      await cloudinary.api.create_folder(
        `file_uploader/${req.user.id}/${name}`,
      );
      await model.create({ data: { name, userId } });
      res.redirect("/folder/");
    },
  ],
  update: [
    validator,
    async (req, res) => {
      const id = Number(req.body.id);
      const userId = Number(req.user.id);

      await cloudinary.api.rename_folder(
        `file_uploader/${userId}/${req.body.old_name}`,
        `file_uploader/${userId}/${req.body.name}`,
      );
      await model.update({
        data: { name: req.body.name },
        where: { id, userId },
      });
      res.redirect("/folder/");
    },
  ],
  delete: async (req, res) => {
    const id = Number(req.body.id);
    const userId = Number(req.user.id);

    await cloudinary.api.delete_folder(
      `file_uploader/${userId}/${req.body.name}`,
    );
    await model.delete({ where: { id, userId } });
    res.redirect("/folder/");
  },
};
