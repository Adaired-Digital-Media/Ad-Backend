import multer from "multer";

const generateRandomAlphanumeric = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
};

const storage = multer.diskStorage({
  destination: "src/static/uploads/",
  filename: (req, file, cb) => {
    const randomString = generateRandomAlphanumeric(5);
    const [name, ext] = file.originalname.split(".");
    cb(null, `${name}_${randomString}.${ext}`);
  },
});

const upload = multer({ storage });

export { upload };
