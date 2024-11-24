const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const path = require("path"); // For handling file paths

const app = express();
const port = 3000;

// Middleware to parse the form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (e.g., CSS, JavaScript, and HTML)
app.use(express.static(path.join(__dirname, "public")));

// MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "#Kri$hna0203",
  database: "Safe_Clicks",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the MySQL database.");
  }
});

// Route to serve the registration page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Route to handle the registration form submission
app.post("/register", async (req, res) => {
  const { full_name, email, password, confirm_password } = req.body;

  // Check if passwords match
  if (password !== confirm_password) {
    return res.status(400).send("Passwords do not match.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
    db.query(query, [full_name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error inserting data:", err.message);
        res.status(500).send("An error occurred. Please try again.");
      } else {
        res.status(200).send("User registered successfully!");
      }
    });
  } catch (error) {
    res.status(500).send("Error hashing password. Please try again.");
  }
});

// Route to serve the login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Updated route to handle login form submission
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please provide both email and password.");
  }

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).send("Server error. Please try again.");
      }

      if (results.length === 0) {
        return res.status(400).send("Invalid email or password.");
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(400).send("Invalid email or password.");
      }

      console.log("User logged in successfully!");

      // Redirect to the services page with a query parameter to show the popup
      res.redirect("/services.html?loginSuccess=1");
    });
  } catch (error) {
    console.error("Error handling login:", error.message);
    res.status(500).send("Server error. Please try again.");
  }
});

// Route to serve the feedback page
app.get("/feedback", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "feedback.html"));
});

// Route to handle Feedback form submission
app.post("/feedback", (req, res) => {
  const { name, email, feedback } = req.body;

  if (!name || !email || !feedback) {
    return res.status(400).send("All fields are required.");
  }

  const query = "INSERT INTO feedback (name, email, feedback) VALUES (?, ?, ?)";
  db.query(query, [name, email, feedback], (err) => {
    if (err) {
      console.error("Error saving feedback:", err.message);
      return res.status(500).send("An error occurred. Please try again.");
    }

    console.log("Feedback saved successfully!");

    // Render the feedback page with a success message
    res.sendFile(path.join(__dirname, "public", "feedback.html")); // Keep the user on the feedback page
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
