const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcryptjs");

const model = new PrismaClient().user;
module.exports = {
  new(req, res) {
    res.status(200).render("user/new", { title: "Register" });
  },
  async create(req, res) {
    let { username, password } = req.body;
    password = await bcrypt.hash(password, 10);

    const user = await model.create({ data: { username, password } });
    res.redirect("/login");
  },
};
