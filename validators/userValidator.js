const { body } = require("express-validator");

const errors = {
  alpha: "must contain letters only",
  email: "must be a valid email",
  fieldMatch: "must match",
};

module.exports = [
  body("username")
    .trim()
    .isAlpha()
    .withMessage("username " + errors.alpha),
  body("confirm")
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords " + errors.fieldMatch),
];