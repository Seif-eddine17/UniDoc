const express = require("express");
const PDFDocument = require("pdfkit");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <h2>UniDoc - Internship Request Letter</h2>
    <form method="POST" action="/generate">
      <label>Full Name:</label><br/>
      <input name="fullName" required /><br/><br/>

      <label>Student ID:</label><br/>
      <input name="studentId" required /><br/><br/>

      <label>Department:</label><br/>
      <input name="department" required /><br/><br/>

      <label>Company Name:</label><br/>
      <input name="company" required /><br/><br/>

      <label>Date:</label><br/>
      <input name="date" required /><br/><br/>

      <button type="submit">Generate PDF</button>
    </form>
  `);
});

app.post("/generate", (req, res) => {
  const { fullName, studentId, department, company, date } = req.body;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="internship_letter.pdf"');

  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(16).text("Internship Request Letter", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Date: ${date}`);
  doc.moveDown();

  doc.text("To whom it may concern,");
  doc.moveDown();

  doc.text(
    `I am ${fullName} (Student ID: ${studentId}), a student in the ${department} department. ` +
    `I kindly request an internship letter addressed to ${company} to support my internship application.`
  );
  doc.moveDown();

  doc.text("Sincerely,");
  doc.text(fullName);

  doc.end();
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
