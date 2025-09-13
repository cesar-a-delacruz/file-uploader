const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const pgSession = require("connect-pg-simple")(session);
const auth = require("./auth");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
dotenv.config();

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.session());
passport.use(auth.strategy);
passport.serializeUser(auth.serializer);
passport.deserializeUser(auth.deserializer);

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.redirect("/");
  });
});

app.listen(process.env.APP_PORT, (error) => {
  if (error) throw error;
  console.log("running...");
});
