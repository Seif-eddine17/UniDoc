const express = require("express");
const PDFDocument = require("pdfkit");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public")); // ← we'll put CSS + images here

// In-memory storage (just for demo)
const users = [];

// ────────────────────────────────────────────────
//                  HTML + CSS Page
// ────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UniDoc • Internship Request Letter</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      padding: 2.5rem 2rem;
      width: 100%;
      max-width: 480px;
    }

    h1 {
      color: #2c3e50;
      text-align: center;
      margin-bottom: 2rem;
      font-weight: 600;
      font-size: 1.8rem;
    }

    .form-group {
      margin-bottom: 1.4rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #34495e;
      font-weight: 500;
      font-size: 0.95rem;
    }

    input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #d1d9e6;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .btn {
      width: 100%;
      padding: 14px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.05rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.25s;
      margin-top: 1.5rem;
    }

    .btn:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.25);
    }

    .footer {
      text-align: center;
      margin-top: 2rem;
      color: #64748b;
      font-size: 0.85rem;
    }

    @media (max-width: 480px) {
      .container {
        padding: 2rem 1.5rem;
      }
      h1 {
        font-size: 1.6rem;
      }
    }
  </style>
</head>
<body>

  <div class="container">
    <h1>Internship Request Letter</h1>

    <form method="POST" action="/generate">
      <div class="form-group">
        <label for="fullName">Full Name</label>
        <input type="text" id="fullName" name="fullName" required placeholder="e.g. John Doe" />
      </div>

      <div class="form-group">
        <label for="studentId">Student ID / Matric Number</label>
        <input type="text" id="studentId" name="studentId" required placeholder="e.g. 2021/12345" />
      </div>

      <div class="form-group">
        <label for="department">Department</label>
        <input type="text" id="department" name="department" required placeholder="e.g. Computer Science" />
      </div>

      <div class="form-group">
        <label for="company">Company / Organization Name</label>
        <input type="text" id="company" name="company" required placeholder="e.g. Google Nigeria" />
      </div>

      <div class="form-group">
        <label for="date">Date</label>
        <input type="date" id="date" name="date" required value="${new Date().toISOString().split('T')[0]}" />
      </div>

      <button type="submit" class="btn">Generate PDF Letter</button>
    </form>

se
  </div>

</body>
</html>
  `);
});

// ────────────────────────────────────────────────
//                  API Endpoints (optional)
// ────────────────────────────────────────────────
app.post("/api/users", (req, res) => {
  const { fullName, studentId, department } = req.body;

  if (!fullName || !studentId || !department) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newUser = { id: users.length + 1, fullName, studentId, department };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

// ────────────────────────────────────────────────
//                  PDF Generation
// ────────────────────────────────────────────────
app.post("/generate", (req, res) => {
  const { fullName, studentId, department, company, date } = req.body;

  if (!fullName || !studentId || !department || !company || !date) {
    return res.status(400).send("Missing required fields");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Internship-Request-${fullName.replace(/\s+/g, "-")}.pdf"`
  );

  const doc = new PDFDocument({ margin: 72, size: "A4" });
  doc.pipe(res);

  // Header
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("INTERNSHIP REQUEST LETTER", { align: "center" });

  doc.moveDown(2);

  // Date
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Date: ${new Date(date).toLocaleDateString("en-GB")}`, { align: "right" });

  doc.moveDown(1.5);

  // Salutation
  doc.fontSize(12).text("To Whom It May Concern,", { align: "left" });

  doc.moveDown(1);

  // Body
  doc.fontSize(12).text(
    `I, ${fullName} (Student ID: ${studentId}), a student of the ${department} Department ` +
    `at my university, am writing to kindly request an official letter of support for my ` +
    `internship application to ${company}.\n\n` +
    `This letter will greatly assist me in completing the necessary documentation required ` +
    `by the company and my institution.\n\n` +
    `Thank you for your kind assistance. I would be grateful if this could be prepared at your earliest convenience.`,
    { align: "justify", lineGap: 4 }
  );

  doc.moveDown(2);

  // Closing
  doc.text("Yours sincerely,", { align: "left" });
  doc.moveDown(1);
  doc.font("Helvetica-Bold").text(fullName);

  doc.end();
});

app.listen(port, () => {
  console.log(`Server running → http://localhost:${port}`);
});