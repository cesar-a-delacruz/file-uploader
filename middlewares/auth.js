const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../generated/prisma");
const model = new PrismaClient().user;

module.exports = {
  strategy: new LocalStrategy(async (username, password, done) => {
    try {
      const user = await model.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
  serializer: (user, done) => done(null, user.id),
  deserializer: async (id, done) => {
    try {
      const user = await model.findFirst({
        where: {
          id: id,
        },
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  },
};
