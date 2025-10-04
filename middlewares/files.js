const { PrismaClient } = require("../generated/prisma");
const folderModel = new PrismaClient().folder;
const path = require("path");
const fs = require("fs");
const multer = require("multer");

module.exports = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const folderName = (
        await folderModel.findFirst({ where: { id: Number(req.body.folder) } })
      ).name;
      const uploadPath = `uploads/${req.user.id}/${folderName}`;
      fs.readdir(uploadPath, (err) => {
        if (err) {
          fs.mkdir(uploadPath, (err) => {
            if (err) console.log(err);
            else cb(null, uploadPath);
          });
        } else cb(null, uploadPath);
      });
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      const name = req.body.name;
      req.ext = extension;
      cb(null, name + extension);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
