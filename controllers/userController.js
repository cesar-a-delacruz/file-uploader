const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcryptjs");
const { validationResult }= require('express-validator')
const validator = require("../validators/userValidator");

const model = new PrismaClient().user;
module.exports = {
  new(req, res) {
    res.status(200).render("user/new", { title: "Register" });
  },
  create:[validator, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());
    
    let { username, password } = req.body;
    password = await bcrypt.hash(password, 10);
    const user = await model.create({ data: { username, password } });
    res.redirect("/login");
  },]
};
