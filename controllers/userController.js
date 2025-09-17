const { PrismaClient } = require("../generated/prisma");
const model = new PrismaClient().user;
module.exports = {
  new(req, res) {
    res.status(200).render("user/new", { title: "Register" });
  },
  async create(req, res) {
    const { username, password } = req.body;
    const user = await model.create({ data: { username, password } });
    res.redirect("/login");
  },
};
