const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const app = express();
const multer = require("multer");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Function to hash password when creating a user
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.match(/:\d+$/)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(fileUpload());
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

const db = mysql.createPool({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "",
  database: "gestion_bureau_dordre",
  timezone: "Z",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ---------------------------- Arrivee ----------------------------------------------------

app.post("/arrivee", (req, res) => {
  const {
    dateA: dateDordre,
    dateL: dateLettre,
    num: numeroLettre,
    exp: expediteur,
    obj: objet,
    nbr: numeroArr,
  } = req.body;

  let filePath = null;
  if (req.files && req.files.file) {
    const file = req.files.file;

    // Ensure unique filenames
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const uploadPath = path.join(__dirname, "public/images", uniqueFileName);

    // Ensure the directory exists
    const uploadDir = path.join(__dirname, "public/images");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      file.mv(uploadPath, (err) => {
        if (err) {
          console.error("Error saving file:", err);
          return res
            .status(500)
            .json({ error: "Error saving file", details: err.message });
        }
        console.log(`File uploaded successfully: ${uniqueFileName}`);
      });

      filePath = `/images/${uniqueFileName}`;
    } catch (error) {
      console.error("File upload error:", error);
      return res
        .status(500)
        .json({ error: "File upload failed", details: error.message });
    }
  }

  const insertArriveQuery = `
    INSERT INTO arrivee (
      objet,
      expediteur,
      numero_lettre,
      date_lettre,
      date_darrivee,
      num_dordre_arrivee,
      file_path
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    objet,
    expediteur,
    numeroLettre,
    dateLettre,
    dateDordre,
    numeroArr,
    filePath,
  ];

  db.query(insertArriveQuery, values, (err, result) => {
    if (err) {
      console.error("Error adding Arrive:", err);
      return res
        .status(500)
        .json({ error: "Error adding Arrive", details: err.message });
    }
    console.log("Arrive added successfully");
    return res.status(200).json({
      message: "Arrive added successfully",
      id: result.insertId,
    });
  });
});

app.get("/arrivee", (req, res) => {
  const { year } = req.query;

  let sql = `
    SELECT * 
    FROM arrivee 
  `;

  if (year) {
    sql += ` WHERE YEAR(date_darrivee) = ?`;
  }

  sql += ` ORDER BY YEAR(date_darrivee) DESC, num_dordre_arrivee DESC`;

  db.query(sql, year ? [year] : [], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.put("/arrivee/:id", (req, res) => {
  const { id } = req.params;
  const {
    dateA: dateDordre,
    dateL: dateLettre,
    num: numeroLettre,
    exp: expediteur,
    obj: objet,
  } = req.body;

  let filePath = null;
  if (req.files && req.files.file) {
    const file = req.files.file;
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const uploadPath = path.join(__dirname, "public/images", uniqueFileName);

    const uploadDir = path.join(__dirname, "public/images");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      file.mv(uploadPath, (err) => {
        if (err) {
          console.error("Error saving file:", err);
          return res
            .status(500)
            .json({ error: "Error saving file", details: err.message });
        }
      });

      filePath = `/images/${uniqueFileName}`;
    } catch (error) {
      console.error("File upload error:", error);
      return res
        .status(500)
        .json({ error: "File upload failed", details: error.message });
    }
  }

  const updateQuery = `
    UPDATE arrivee 
    SET 
      objet = ?,
      expediteur = ?,
      numero_lettre = ?,
      date_lettre = ?,
      date_darrivee = ?,
      file_path = COALESCE(?, file_path)
    WHERE id_arrivee = ?
  `;

  const values = [
    objet,
    expediteur,
    numeroLettre,
    dateLettre,
    dateDordre,
    filePath,
    id,
  ];

  db.query(updateQuery, values, (err, result) => {
    if (err) {
      console.error("Error updating Arrive:", err);
      return res
        .status(500)
        .json({ error: "Error updating Arrive", details: err.message });
    }

    return res.status(200).json({
      message: "Arrive updated successfully",
      id: id,
    });
  });
});

app.delete("/arrive/:id", (req, res) => {
  const { id } = req.params;

  const deleteQuery = "DELETE FROM arrivee WHERE id_arrivee = ?";

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error("Error deleting Arrive:", err);
      return res.status(500).json({
        error: "Error deleting Arrive",
        details: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Arrivée not found",
      });
    }

    return res.status(200).json({
      message: "Arrivée deleted successfully",
    });
  });
});

// ---------------------------- Depart ----------------------------------------------------

// Route pour ajouter un départ
app.post("/depart", (req, res) => {
  const {
    dateD: dateDepart,
    destinataire,
    obj: objet,
    numOrdre: numOrdreDepart,
  } = req.body;

  let filePath = null;
  if (req.files && req.files.file) {
    const file = req.files.file;

    // Ensure unique filenames
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const uploadPath = path.join(__dirname, "public/uploads", uniqueFileName);

    // Ensure the directory exists
    const uploadDir = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      file.mv(uploadPath, (err) => {
        if (err) {
          console.error("Error saving file:", err);
          return res
            .status(500)
            .json({ error: "Error saving file", details: err.message });
        }
        console.log(`File uploaded successfully: ${uniqueFileName}`);
      });

      filePath = `/uploads/${uniqueFileName}`;
    } catch (error) {
      console.error("File upload error:", error);
      return res
        .status(500)
        .json({ error: "File upload failed", details: error.message });
    }
  }

  const insertDepartQuery = `
    INSERT INTO depart (
      date_depart,
      destinataire,
      objet,
      num_dordre_depart,
      file_path
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [dateDepart, destinataire, objet, numOrdreDepart, filePath];

  db.query(insertDepartQuery, values, (err, result) => {
    if (err) {
      console.error("Error adding Depart:", err);
      return res
        .status(500)
        .json({ error: "Error adding Depart", details: err.message });
    }
    console.log("Depart added successfully");
    return res.status(200).json({
      message: "Depart added successfully",
      id: result.insertId,
    });
  });
});

// Route pour récupérer les départs
app.get("/depart", (req, res) => {
  const { year } = req.query;

  let sql = `
    SELECT * 
    FROM depart 
  `;

  if (year) {
    sql += ` WHERE YEAR(date_depart) = ?`;
  }

  sql += ` ORDER BY YEAR(date_depart) DESC, num_dordre_depart DESC`;

  db.query(sql, year ? [year] : [], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Route pour récupérer les années distinctes des départs
app.get("/depart/years", (req, res) => {
  const sql =
    "SELECT DISTINCT YEAR(date_depart) as year FROM depart ORDER BY year DESC";
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data.map((row) => row.year));
  });
});

// Route pour mettre à jour un départ
app.put("/depart/:id", (req, res) => {
  const { id } = req.params;
  const {
    dateD: dateDepart,
    destinataire,
    obj: objet,
    numOrdre: numOrdreDepart,
  } = req.body;

  let filePath = null;
  if (req.files && req.files.file) {
    const file = req.files.file;
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const uploadPath = path.join(__dirname, "public/uploads", uniqueFileName);

    const uploadDir = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      file.mv(uploadPath, (err) => {
        if (err) {
          console.error("Error saving file:", err);
          return res
            .status(500)
            .json({ error: "Error saving file", details: err.message });
        }
      });

      filePath = `/uploads/${uniqueFileName}`;
    } catch (error) {
      console.error("File upload error:", error);
      return res
        .status(500)
        .json({ error: "File upload failed", details: error.message });
    }
  }

  const updateQuery = `
    UPDATE depart 
    SET 
      date_depart = ?,
      destinataire = ?,
      objet = ?,
      num_dordre_depart = ?,
      file_path = COALESCE(?, file_path)
    WHERE num_dordre_depart = ?
  `;

  const values = [
    dateDepart,
    destinataire,
    objet,
    numOrdreDepart,
    filePath,
    id,
  ];

  db.query(updateQuery, values, (err, result) => {
    if (err) {
      console.error("Error updating Depart:", err);
      return res
        .status(500)
        .json({ error: "Error updating Depart", details: err.message });
    }

    return res.status(200).json({
      message: "Depart updated successfully",
      id: id,
    });
  });
});

// Route pour supprimer un départ
app.delete("/depart/:id", (req, res) => {
  const { id } = req.params;

  const deleteQuery = "DELETE FROM depart WHERE num_dordre_depart = ?";

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error("Error deleting Depart:", err);
      return res.status(500).json({
        error: "Error deleting Depart",
        details: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Depart not found",
      });
    }

    return res.status(200).json({
      message: "Depart deleted successfully",
    });
  });
});

// --------------------------------------------------------------
app.post("/register", async (req, res) => {
  try {
    const { username, password, privileges } = req.body;
    const hashedPassword = await hashPassword(password); // Hash the password

    const sql =
      "INSERT INTO users (username, password, privileges) VALUES (?, ?, ?)";
    db.query(sql, [username, hashedPassword, privileges], (err, result) => {
      if (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ error: "Error registering user" });
      }
      res.json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const sql =
      "SELECT user_id, username, password, privileges FROM users WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      const user = results[0];
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          user_id: user.user_id,
          username: user.username,
          privileges: user.privileges,
        },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.json({
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          privileges: user.privileges,
        },
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(8887, "0.0.0.0", () => {
  const sql = "SELECT * FROM depart";
  db.query(sql, (err, data) => {
    if (err) return console.log("Cannot connect to Database...");
    return console.log("Database connected ...");
  });
});
