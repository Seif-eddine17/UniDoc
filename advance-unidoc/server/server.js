const express = require("express");
const PDFDocument = require("pdfkit");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = [
 "http://localhost:5173",
 "http://localhost:3000",
 "https://uni-doc.vercel.app",
];
app.set("trust proxy", 1);
app.use(
 cors({
   origin: function (origin, callback) {
     if (!origin || allowedOrigins.includes(origin)) {
       callback(null, true);
     } else {
       callback(new Error("Not allowed by CORS"));
     }
   },
   credentials: true,
 })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
 session({
   secret: process.env.SESSION_SECRET || "unidoc-secret",
   resave: false,
   saveUninitialized: false,
   cookie: {
     secure: process.env.NODE_ENV === "production",
     httpOnly: true,
     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
     maxAge: 1000 * 60 * 60 * 24,
   },
 })
);
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
 if (err) {
   console.log("Database error:", err.message);
 } else {
   console.log("Database connected");
 }
});
db.serialize(() => {
 db.run(`
   CREATE TABLE IF NOT EXISTS users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     username TEXT UNIQUE,
     password TEXT
   )
 `);
});
function checkAuth(req, res, next) {
 if (req.session && req.session.loggedIn) {
   next();
 } else {
   res.status(401).json({ message: "Unauthorized. Please login first." });
 }
}
app.get("/", (req, res) => {
 res.json({
   message: "Advance UniDoc backend is running",
 });
});
app.get("/health", (req, res) => {
 res.status(200).json({
   status: "ok",
   service: "advance-unidoc-backend",
 });
});
app.post("/register", (req, res) => {
 const { username, password } = req.body;
 if (!username || !password) {
   return res
     .status(400)
     .json({ message: "Username and password are required" });
 }
 const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
 db.run(query, [username, password], function (err) {
   if (err) {
     return res.status(400).json({ message: "User already exists" });
   }
   res.status(201).json({
     message: "User registered successfully",
   });
 });
});
app.post("/login", (req, res) => {
 const { username, password } = req.body;
 if (!username || !password) {
   return res
     .status(400)
     .json({ message: "Username and password are required" });
 }
 const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
 db.get(query, [username, password], (err, row) => {
   if (err) {
     return res.status(500).json({ message: "Server error" });
   }
   if (!row) {
     return res.status(401).json({
       message: "Invalid username or password",
     });
   }
   req.session.loggedIn = true;
   req.session.user = username;
   res.json({
     message: "Login successful",
     user: username,
   });
 });
});
app.post("/logout", (req, res) => {
 req.session.destroy(() => {
   res.json({ message: "Logged out successfully" });
 });
});
app.get("/me", (req, res) => {
 if (req.session && req.session.loggedIn) {
   res.json({
     loggedIn: true,
     user: req.session.user,
   });
 } else {
   res.json({
     loggedIn: false,
   });
 }
});
app.post("/generate", checkAuth, (req, res) => {
 const { fullName, studentId, department, company, date } = req.body;
 if (!fullName || !studentId || !department || !company || !date) {
   return res.status(400).json({
     message: "All fields are required",
   });
 }
 const formattedDate = new Date(date).toLocaleDateString("en-GB", {
   day: "2-digit",
   month: "long",
   year: "numeric",
 });
 res.setHeader("Content-Type", "application/pdf");
 res.setHeader(
   "Content-Disposition",
   `attachment; filename=Internship-${fullName}.pdf`
 );
 const doc = new PDFDocument({
   size: "A4",
   margin: 60,
 });
 doc.pipe(res);
 doc
   .strokeColor("#0f172a")
   .lineWidth(2)
   .moveTo(60, 50)
   .lineTo(535, 50)
   .stroke();
 doc.moveDown(0.5);
 doc
   .font("Helvetica-Bold")
   .fontSize(20)
   .fillColor("black")
   .text("INTERNSHIP REQUEST LETTER", {
     align: "center",
   });
 doc.moveDown(1.5);
 doc.font("Helvetica").fontSize(12).text(`Date: ${formattedDate}`, {
   align: "right",
 });
 doc.moveDown(2);
 doc.text("To Whom It May Concern,", {
   align: "left",
 });
 doc.moveDown(1.5);
 const body = [
   `I am writing to respectfully submit my request for an internship opportunity at ${company}. My name is ${fullName}, and I am currently pursuing my studies in the ${department} department. As part of my academic journey, I am seeking an internship placement that will allow me to connect theoretical learning with practical professional experience.`,
   `This internship represents an important step in my academic and career development. It would provide me with the opportunity to strengthen my skills, expand my understanding of workplace practices, and gain valuable exposure to the professional environment. As a student identified by Student ID ${studentId}, I am fully committed to making the most of such an opportunity through dedication, discipline, and continuous learning.`,
   `I am highly motivated to join an organization where I can contribute positively while also learning from experienced professionals. I believe that working within ${company} would help me improve my technical abilities, communication skills, sense of responsibility, and capacity to adapt to real-world challenges.`,
   `I would therefore be honored if you would consider my application for an internship placement. I am confident that this experience would greatly support my professional growth and help me build a stronger foundation for my future career. I remain available for any additional information, documents, or formalities that may be required.`,
   `Thank you very much for your time and consideration. I sincerely appreciate your attention to my request and look forward to the opportunity to benefit from your professional guidance and environment.`,
 ];
 body.forEach((paragraph) => {
   doc.text(paragraph, {
     align: "justify",
     lineGap: 4,
   });
   doc.moveDown(1);
 });
 doc.moveDown(1.5);
 doc.text("Yours faithfully,", { align: "left" });
 doc.moveDown(2);
 doc.font("Helvetica-Bold").text(fullName, { align: "left" });
 doc
   .fontSize(10)
   .fillColor("gray")
   .text("Generated by Advance UniDoc", 60, 770, {
     align: "center",
     width: 475,
   });
 doc.end();
});
app.listen(port, () => {
 console.log(`Server running on port ${port}`);
});