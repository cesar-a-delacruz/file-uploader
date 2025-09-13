const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
// const userModel = require("./models/userModel");

module.exports = {
  strategy: new LocalStrategy(async (username, password, done) => {
    try {
    //   const user = await userModel.findByEmail(username);
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
    //   const user = await userModel.find(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  },
};
