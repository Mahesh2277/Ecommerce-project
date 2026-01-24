const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

// Load environment variables first
require("dotenv").config();

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({
  origin: "*"
}));

// Database Connection With MongoDB
mongoose.connect(`${process.env.MONGODBURL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch((error) => {
  console.error("MongoDB connection error:", error.message);
  process.exit(1);
});


// Ensure upload directory exists
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//Image Storage Engine 
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ storage: storage })
app.post("/upload", upload.single('product'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: 0,
        error: "No file uploaded"
      });
    }
    res.json({
      success: 1,
      image_url: `/images/${req.file.filename}`
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: 0,
      error: "File upload failed"
    });
  }
})




// Route for Images folder
app.use('/images', express.static('upload/images'));


// MiddleWare to fetch user from token
const fetchuser = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};


// Schema for creating user model
const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { type: Object },
  date: { type: Date, default: Date.now() },
});


// Schema for creating Product
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});


// ROOT API Route For Testing
app.get("/", (req, res) => {
  res.send("Root");
});


// Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login', async (req, res) => {
  try {
    console.log("Login");
    let success = false;
    
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ success: false, errors: "Email and password are required" });
    }

    let user = await Users.findOne({ email: req.body.email });
    if (user) {
      const passCompare = req.body.password === user.password;
      if (passCompare) {
        const data = {
          user: {
            id: user.id
          }
        }
        success = true;
        console.log(user.id);
        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success, token });
      }
      else {
        return res.status(400).json({ success: success, errors: "please try with correct email/password" })
      }
    }
    else {
      return res.status(400).json({ success: success, errors: "please try with correct email/password" })
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
})


//Create an endpoint at ip/auth for regestring the user & sending auth-token
app.post('/signup', async (req, res) => {
  try {
    console.log("Sign Up");
    let success = false;
    
    if (!req.body.email || !req.body.password || !req.body.username) {
      return res.status(400).json({ success: false, errors: "Username, email and password are required" });
    }

    let check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ success: success, errors: "existing user found with this email" });
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      cartData: cart,
    });
    await user.save();
    const data = {
      user: {
        id: user.id
      }
    }

    const token = jwt.sign(data, 'secret_ecom');
    success = true;
    res.json({ success, token })
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, errors: "Email already exists" });
    }
    res.status(500).json({ success: false, errors: "Internal server error" });
  }
})


// endpoint for getting all products data
app.get("/allproducts", async (req, res) => {
  try {
    let products = await Product.find({});
    console.log("All Products");
    res.send(products);
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});


// endpoint for getting latest products data
app.get("/newcollections", async (req, res) => {
  try {
    let products = await Product.find({});
    let arr = products.slice(0).slice(-8);
    console.log("New Collections");
    res.send(arr);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ error: "Failed to fetch new collections" });
  }
});


// endpoint for getting womens products data
app.get("/popularinwomen", async (req, res) => {
  try {
    let products = await Product.find({ category: "women" });
    let arr = products.splice(0, 4);
    console.log("Popular In Women");
    res.send(arr);
  } catch (error) {
    console.error("Error fetching popular in women:", error);
    res.status(500).json({ error: "Failed to fetch popular products" });
  }
});

// endpoint for getting womens products data
app.post("/relatedproducts", async (req, res) => {
  try {
    console.log("Related Products");
    const {category} = req.body;
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }
    const products = await Product.find({ category });
    const arr = products.slice(0, 4);
    res.send(arr);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ error: "Failed to fetch related products" });
  }
});


// Create an endpoint for saving the product in cart
app.post('/addtocart', fetchuser, async (req, res) => {
  try {
    console.log("Add Cart");
    if (!req.body.itemId) {
      return res.status(400).json({ error: "Item ID is required" });
    }
    let userData = await Users.findOne({ _id: req.user.id });
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!userData.cartData[req.body.itemId]) {
      userData.cartData[req.body.itemId] = 0;
    }
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Added")
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
})


// Create an endpoint for removing the product in cart
app.post('/removefromcart', fetchuser, async (req, res) => {
  try {
    console.log("Remove Cart");
    if (!req.body.itemId) {
      return res.status(400).json({ error: "Item ID is required" });
    }
    let userData = await Users.findOne({ _id: req.user.id });
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    if (userData.cartData[req.body.itemId] != 0) {
      userData.cartData[req.body.itemId] -= 1;
    }
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Removed");
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
})


// Create an endpoint for getting cartdata of user
app.post('/getcart', fetchuser, async (req, res) => {
  try {
    console.log("Get Cart");
    let userData = await Users.findOne({ _id: req.user.id });
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(userData.cartData || {});
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: "Failed to fetch cart data" });
  }
})


// Create an endpoint for adding products using admin panel
app.post("/addproduct", async (req, res) => {
  try {
    if (!req.body.name || !req.body.description || !req.body.image || !req.body.category) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      id = last_product.id + 1;
    }
    else { id = 1; }
    const product = new Product({
      id: id,
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });
    await product.save();
    console.log("Saved");
    res.json({ success: true, name: req.body.name })
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ success: false, error: "Failed to add product" });
  }
});


// Create an endpoint for removing products using admin panel
app.post("/removeproduct", async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({ success: false, error: "Product ID is required" });
    }
    const result = await Product.findOneAndDelete({ id: req.body.id });
    if (!result) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    console.log("Removed");
    res.json({ success: true, name: req.body.name })
  } catch (error) {
    console.error("Remove product error:", error);
    res.status(500).json({ success: false, error: "Failed to remove product" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Starting Express Server
const server = app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on port " + port);
  } else {
    console.log("Error : ", error);
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    console.error("Server error:", error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});