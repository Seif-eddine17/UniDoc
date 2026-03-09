const express = require("express");
const PDFDocument = require("pdfkit");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "unidoc-secret",
    resave: false,
    saveUninitialized: true,
  })
);

/* ---------------- DATABASE ---------------- */

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Database connected");
  }
});

db.run(`
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
password TEXT
)
`);

/* ---------------- AUTH MIDDLEWARE ---------------- */

function checkAuth(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
}

/* ---------------- REGISTER PAGE ---------------- */

app.get("/register", (req, res) => {
  res.send(`
  <html>
  <head>
  <title>Register</title>
  <style>
  body{font-family:Arial;background:#eef2ff;display:flex;justify-content:center;align-items:center;height:100vh;}
  .box{background:white;padding:40px;border-radius:10px;width:300px}
  input{width:100%;padding:10px;margin:10px 0}
  button{width:100%;padding:10px;background:#6366f1;color:white;border:none;border-radius:6px}
  a{text-decoration:none}
  </style>
  </head>

  <body>

  <div class="box">

  <h2>Register</h2>

  <form method="POST" action="/register">

  <input name="username" placeholder="Username" required>

  <input type="password" name="password" placeholder="Password" required>

  <button type="submit">Register</button>

  </form>

  <p>Already have account? <a href="/login">Login</a></p>

  </div>

  </body>
  </html>
  `);
});

/* ---------------- REGISTER LOGIC ---------------- */

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const query = `INSERT INTO users(username,password) VALUES (?,?)`;

  db.run(query, [username, password], function (err) {
    if (err) {
      return res.send("User already exists");
    }

    res.redirect("/login");
  });
});

/* ---------------- LOGIN PAGE ---------------- */

app.get("/login", (req, res) => {
  res.send(`
  <html>
  <head>
  <title>Login</title>

  <style>
  body{font-family:Arial;background:#6366f1;display:flex;justify-content:center;align-items:center;height:100vh;}
  .box{background:white;padding:40px;border-radius:10px;width:300px}
  input{width:100%;padding:10px;margin:10px 0}
  button{width:100%;padding:10px;background:#6366f1;color:white;border:none;border-radius:6px}
  a{text-decoration:none}
  </style>

  </head>

  <body>

  <div class="box">

  <h2>Login</h2>

  <form method="POST" action="/login">

  <input name="username" placeholder="Username" required>

  <input type="password" name="password" placeholder="Password" required>

  <button type="submit">Login</button>

  </form>

  <p>No account? <a href="/register">Register</a></p>

  </div>

  </body>
  </html>
  `);
});

/* ---------------- LOGIN LOGIC ---------------- */

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username=? AND password=?`;

  db.get(query, [username, password], (err, row) => {
    if (row) {
      req.session.loggedIn = true;
      req.session.user = username;
      res.redirect("/");
    } else {
      res.send("Invalid login");
    }
  });
});

/* ---------------- LOGOUT ---------------- */

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

/* ---------------- MAIN PAGE ---------------- */

app.get("/", checkAuth, (req, res) => {
  res.send(`
<html>

<head>

<title>UniDoc</title>

<style>

body{
font-family:Arial;
background:#eef2ff;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
}

.container{
background:white;
padding:40px;
border-radius:12px;
width:400px;
}

input{
width:100%;
padding:10px;
margin:10px 0;
}

button{
width:100%;
padding:12px;
background:#6366f1;
border:none;
color:white;
border-radius:6px;
}

a{
display:block;
margin-top:10px;
text-align:center;
}

</style>

</head>

<body>

<div class="container">

<h2>Internship Letter</h2>

<form method="POST" action="/generate">

<input name="fullName" placeholder="Full Name" required>

<input name="studentId" placeholder="Student ID" required>

<input name="department" placeholder="Department" required>

<input name="company" placeholder="Company Name" required>

<input type="date" name="date" required>

<button type="submit">Generate PDF</button>

</form>

<a href="/logout">Logout</a>

</div>

</body>

</html>
`);
});

/* ---------------- PDF GENERATION ---------------- */

app.post("/generate", checkAuth, (req, res) => {
  const { fullName, studentId, department, company, date } = req.body;

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Internship-${fullName}.pdf`
  );

  const doc = new PDFDocument();

  doc.pipe(res);

  doc.fontSize(20).text("INTERNSHIP REQUEST LETTER", { align: "center" });

  doc.moveDown();

  doc.text(`Date: ${date}`, { align: "right" });

  doc.moveDown();

  doc.text("To Whom It May Concern,");

  doc.moveDown();

  doc.text(
    `I, ${fullName} (Student ID: ${studentId}), a student of the ${department} department, kindly request an internship opportunity at ${company}.`
  );

  doc.moveDown();

  doc.text("Yours sincerely,");

  doc.moveDown();

  doc.text(fullName);

  doc.end();
});

/* ---------------- SERVER ---------------- */

app.listen(port, () => {
  console.log("Server running at http://localhost:3000");
});