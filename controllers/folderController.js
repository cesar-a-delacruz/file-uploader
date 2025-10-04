const { PrismaClient } = require("../generated/prisma");
const model = new PrismaClient().folder;
const fs = require("fs");

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

    fs.mkdir(`uploads/${userId}/${name}`, (err) => {
      if (err) console.error(err);
    });
    await model.create({ data: { name, userId } });
    res.redirect("/folder/");
  },
  update: async (req, res) => {
    const id = Number(req.body.id);
    const userId = Number(req.user.id);

    fs.rename(
      `uploads/${userId}/${req.body.old_name}`,
      `uploads/${userId}/${req.body.name}`,
      (err) => {
        if (err) console.error(err);
      },
    );
    await model.update({
      data: { name: req.body.name },
      where: { id, userId },
    });
    res.redirect("/folder/");
  },
  delete: async (req, res) => {
    const id = Number(req.body.id);
    const userId = Number(req.user.id);

    fs.rmdir(
      `uploads/${userId}/${req.body.name}`,
      { recursive: true },
      (err) => {
        if (err) console.error(err);
      },
    );
    await model.delete({ where: { id, userId } });
    res.redirect("/folder/");
  },
};
