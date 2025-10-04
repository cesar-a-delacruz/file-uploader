const { body } = require("express-validator");

const errors = {
  alpha: "must contain letters only",
};

module.exports = [
  body("name")
    .trim()
    .isAlpha()
    .withMessage("name " + errors.alpha),
];
