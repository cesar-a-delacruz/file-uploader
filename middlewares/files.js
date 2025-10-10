const { PrismaClient } = require("../generated/prisma");
const folderModel = new PrismaClient().folder;
const path = require("path");
const fs = require("fs");
const { Buffer } = require("buffer");
const dotenv = require("dotenv");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

const upload = multer({
  storage: multer.memoryStorage({
    destination: async (req, file, cb) => {
      const folderName = (
        await folderModel.findFirst({ where: { id: Number(req.body.folder) } })
      ).name;
      await cloudinary.api
        .search_folders(
          `name=${folderName} AND path:file_uploader/${req.user.id}`,
        )
        .catch(async (err) => {
          await cloudinary.api.create_folder(
            `file_uploader/${req.user.id}/${folderName}`,
          );
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

const fileHandler = async (req, res, next) => {
  try {
    await ((req, res, fn) => {
      return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
          if (result instanceof Error) {
            return reject(result);
          }
          return resolve(result);
        });
      });
    })(req, res, upload.single("file"));

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const folderName = (
      await folderModel.findFirst({ where: { id: Number(req.body.folder) } })
    ).name;
    const file = await cloudinary.uploader.upload(dataURI, {
      folder: `file_uploader/${req.user.id}/${folderName}`,
      public_id: req.body.name,
    });
    req.public_id = file.public_id;
    req.folderName = folderName;
    next();
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  cloudinary,
  upload,
  fileHandler,
};
