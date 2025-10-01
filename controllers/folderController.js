const { PrismaClient } = require("../generated/prisma");
const model = new PrismaClient().folder;
const fs = require("node:fs/promises");

module.exports = {
  async index(req, res) {
    const folders = await model.findMany({ where: { userId: req.user.id } });
    res.status(200).render("folder/index", { title: "All Folders", folders });
  },
  async new(req, res) {
    res.status(200).render("folder/new", { title: "New Folder" });
  },
  async edit(req, res) {
    const userId = Number(req.user.id);
    const folder = await model.findFirst({
      where: { userId, name: req.params.name },
    });
    res.status(200).render("folder/edit", { title: "Edit Folder", folder });
  },
  create: async (req, res) => {
    const name = req.body.name;
    const userId = req.user.id;

    try {
      await fs.mkdir(`uploads/${userId}/${name}`);
      await model.create({ data: { name, userId } });
      res.redirect("/folder/");
    } catch (err) {
      console.error(err);
    }
  },
  update: async (req, res) => {
    const id = Number(req.body.id);
    const userId = Number(req.user.id);

    try {
      await fs.rename(
        `uploads/${userId}/${req.body.old_name}`,
        `uploads/${userId}/${req.body.name}`,
      );
      await model.update({
        data: { name: req.body.name },
        where: { id, userId },
      });
      res.redirect("/folder/");
    } catch (err) {
      console.error(err);
    }
  },
  delete: async (req, res) => {
    const id = Number(req.body.id);
    const userId = Number(req.user.id);

    try {
      await fs.rmdir(`uploads/${userId}/${req.body.name}`, { recursive: true });
      await model.delete({ where: { id, userId } });
      res.redirect("/folder/");
    } catch (err) {
      console.error(err);
    }
  },
};
