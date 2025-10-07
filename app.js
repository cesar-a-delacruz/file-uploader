const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const auth = require("./middlewares/auth");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("./generated/prisma");
const userRouter = require("./routes/userRouter");
const fileRouter = require("./routes/fileRouter");
const folderRouter = require("./routes/folderRouter");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("uploads"));
dotenv.config();

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(passport.session());
passport.use(auth.strategy);
passport.serializeUser(auth.serializer);
passport.deserializeUser(auth.deserializer);

app.get("/login", (req, res) => {
  res.status(200).render("login", {
    title: "Login",
    linkName: "Register",
    link: "/user/new",
  });
});
app.get("/", (req, res) => {
  if (req.user) res.redirect("/folder");
  else res.redirect("/login");
});
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.redirect("/");
  });
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/folder",
    failureRedirect: "/login",
  }),
);

app.use("/user", userRouter);
app.use("/folder", folderRouter);
app.use("/file", fileRouter);

app.listen(process.env.APP_PORT, (error) => {
  if (error) throw error;
  console.log("running...");
});
