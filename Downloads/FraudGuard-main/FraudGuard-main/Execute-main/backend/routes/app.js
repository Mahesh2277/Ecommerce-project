const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");  
const { loginUser, registerUser, getCurrentUser } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');
// const { isLoggedIn } = require("../middlewares/isLoggedIn");
// const userModel = require("../models/userModel");
// const multer = require("multer");
// const dotenv = require("dotenv");
// const {geminiController} = require("../controllers/geminiController");
const {checkFraud} = require("../controllers/ruleBasedController"); 
const transactionController = require('../controllers/transactionController');
const { updateController } = require("../controllers/updateController");
const reportingController = require("../controllers/reportingController");
const analyticsController = require('../controllers/analyticsController');
// dotenv.config();
// const upload = multer();  
// const upload = require("../middlewares/multer");
// const dotenv = require("dotenv");
// const {geminiController} = require("../controllers/geminiController");

// dotenv.config();

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user", protect, getCurrentUser);

// let analyzeCareer;
// // Dynamic import of the ES module
// import('../ai_path.mjs').then(module => {
//     analyzeCareer = module.analyzeCareer;
// }).catch(err => {
//     console.error('Error importing ai_path.mjs:', err);
// });

// // Login Routes
// router.post("/login", loginUser);

// // Signup Route
// router.post("/signup", registerUser);

// router.post("/upload", upload.single("image"), (req, res) => {
//   if (!req.file) {
//     console.log("File not received");
//     return res.status(400).json({ error: "No file uploaded" });
//   }
//   console.log("File uploaded");
//   res.json({ imageUrl: req.file.path }); // Cloudinary URL
// });

router.post("/ruleBased", checkFraud);
// router.post("/upload", upload.single("image"), (req, res) => {
// //   if (!req.file) {
// //     console.log("File not received");
// //     return res.status(400).json({ error: "No file uploaded" });
// //   }
// //   console.log("File uploaded successfully");
// //   res.json({ 
// //     success: true,
// //     imageUrl: req.file.path,
// //     message: "File uploaded successfully"
// //   });
// // });

router.post("/update" , updateController);

router.get('/transactions', transactionController.getTransactions);

router.get('/transactions/stats', transactionController.getTransactionStats);

router.get('/analytics', analyticsController.getAnalytics);

router.post('/result', reportingController.reportFraud);

module.exports = router;
