import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Replace spaces with underscores in the original file name
    const originalName = file.originalname.replace(/\s+/g, '_');
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9) + originalName;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

export { upload };
