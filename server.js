const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 5500;

app.use(express.json());
app.use(express.static(path.join(__dirname, "/")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

let students = [];

app.get("/api/students", (req, res) => {
    res.json(students);
});

app.post("/api/students", (req, res) => {
    const { id, name, father, mother, mobile, course, branch } = req.body;

    if (!id || !name || !father || !mother || !mobile || !course || !branch) {
        return res.status(400).json({ message: "Please provide all student fields." });
    }

    if (students.some((student) => student.id === id)) {
        return res.status(409).json({ message: "A student with the same ID already exists." });
    }

    const newStudent = { id, name, father, mother, mobile, course, branch };
    students.push(newStudent);
    res.status(201).json(newStudent);
});

app.delete("/api/students/:id", (req, res) => {
    const { id } = req.params;
    const originalLength = students.length;
    students = students.filter((student) => student.id !== id);

    if (students.length === originalLength) {
        return res.status(404).json({ message: "Student not found." });
    }

    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});