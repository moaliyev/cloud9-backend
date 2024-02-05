const express = require("express");
const Joi = require("joi");
const app = express();
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

/*********MIDDLEWARE**********/

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

/*********ROUTES**********/

const products = [
  {
    id: "1",
    name: "2023 Cloud9 Official Legacy Summer Jersey",
    price: "69",
    productImage: "uploads/2023 Cloud9 Official Legacy Summer Jersey.webp",
  },
  {
    id: "2",
    name: "2023 Cloud9 Official Summer Jersey - CSGO & SSBM Pro Edition",
    price: "79",
    productImage:
      "uploads/2023 Cloud9 Official Summer Jersey - CSGO & SSBM Pro Edition.webp",
  },
  {
    id: "3",
    name: "2023 Cloud9 Official Summer Jersey - League of Legends Edition",
    price: "69",
    productImage:
      "uploads/2023 Cloud9 Official Summer Jersey - League of Legends Edition.webp",
  },
  {
    id: "4",
    name: "2023 Cloud9 Official Summer Jersey - League of Legends Pro Edition",
    price: "79",
    productImage:
      "uploads/2023 Cloud9 Official Summer Jersey - League of Legends Pro Edition.webp",
  },
  {
    id: "5",
    name: "2023 Cloud9 Official Summer Jersey - VALORANT Edition",
    price: "69",
    productImage:
      "uploads/2023 Cloud9 Official Summer Jersey - VALORANT Edition.webp",
  },
  {
    id: "6",
    name: "2023 Cloud9 Official Summer Jersey - VALORANT Pro Edition",
    price: "79",
    productImage:
      "uploads/2023 Cloud9 Official Summer Jersey - VALORANT Pro Edition.webp",
  },
  {
    id: "7",
    name: "2023 Cloud9 Worlds Jersey - Legacy Edition",
    price: "79",
    productImage: "uploads/2023 Cloud9 Worlds Jersey - Legacy Edition.webp",
  },
  {
    id: "8",
    name: "2023 Cloud9 Worlds Jersey - Pro Edition",
    price: "89",
    productImage: "uploads/2023 Cloud9 Worlds Jersey - Pro Edition.webp",
  },
];

/***********************************************************/
/********* GET: ALL PRODUCTS **********/
/***********************************************************/

app.get("/api/products", (req, res) => {
  res.send(products);
});

/***********************************************************/
/********* GET: SINGLE PRODUCT **********/
/***********************************************************/

app.get("/api/products/:id", (req, res) => {
  const product = products.find(product => product.id === req.params.id);
  if (!product) {
    return res.status(404).send("Product with given id was not found");
  }
  res.send(product);
});

/***********************************************************/
/********* POST: ADD PRODUCT **********/
/***********************************************************/

app.post("/api/products", upload.single("productImage"), (req, res) => {
  //validate product
  const { error } = validateProduct({
    ...req.body,
    productImage: req.file?.path,
  });

  if (error) return res.status(400).send(error);

  const product = {
    id: uuidv4(),
    name: req.body.name,
    details: req.body.details,
    price: req.body.price,
    productImage: req.file.path,
  };

  products.push(product);
  res.send(product);
});

/***********************************************************/
/********* PUT: UPDATE PRODUCT **********/
/***********************************************************/

app.put("/api/products/:id", upload.single("productImage"), (req, res) => {
  //Find product
  const product = products.find(product => product.id === req.params.id);
  if (!product) {
    return res.status(404).send("Product with given id was not found");
  }

  const { error } = validateUpdateProduct({
    ...req.body,
  });

  if (error) return res.status(400).send(error);

  product.name = req.body.name;
  product.details = req.body.details;
  product.price = req.body.price;
  if (req.file) {
    product.productImage = req.file.path;
  }

  res.send(product);
});

/***********************************************************/
/********* DELETE: DELETE PRODUCT **********/
/***********************************************************/

app.delete("/api/products/:id", (req, res) => {
  const product = products.find(product => product.id === req.params.id);
  if (!product) {
    return res.status(404).send("Product with given id was not found");
  }
  const index = products.indexOf(product);
  products.splice(index, 1);

  res.send(products);
});

function validateProduct(product) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    details: Joi.string().min(3).max(200).required(),
    price: Joi.number().required(),
    productImage: Joi.string().required(),
  });

  return schema.validate(product);
}

function validateUpdateProduct(product) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    details: Joi.string().min(3).max(200).required(),
    price: Joi.number().required(),
    productImage: Joi.string(),
  });

  return schema.validate(product);
}

/********* PORT **********/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `http://localhost:${PORT} - dinlənilir...\n\n~~~Məhsullar~~~\n\nBütün məshullar üçün endpoint - /api/products\nTək məhsul üçün endpoint - /api/products/id\nYeni məhsul yaratmaq üçün endpoint - /api/products\n\nYeni məhsulun qəbul olunan formatı:\n{\nname: "string",\ndetails: "string",\nprice: "string",\nproductImage: "base64"\n}\n\nOlan məhsulu dəyişdirmək üçün endpoint - /api/products/id\n\nOlan məhsulu dəyişmək üçün qəbul olunan format:\n{\nname: "string",\ndetails: "string",\nprice: "string",\nproductImage: "base64"\n}\n\nMəhsulu silmək üçün endpoint - api/products/id\n\n\nAPI tədris məqsədi ilə istifadə olunmaq üçün yaradılıb.`
  )
);
