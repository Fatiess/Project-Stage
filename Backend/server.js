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


app.listen(8082, "0.0.0.0", () => {
  const sql = "SELECT * FROM arrivee";
  db.query(sql, (err, data) => {
    if (err) return console.log("Cannot connect to Database...");
    return console.log("Database connected pour arrivee...");
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
  const sql = "SELECT DISTINCT YEAR(date_depart) as year FROM depart ORDER BY year DESC";
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

  const values = [dateDepart, destinataire, objet, numOrdreDepart, filePath, id];

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

// Démarrer le serveur
app.listen(8887, "0.0.0.0", () => {
  const sql = "SELECT * FROM depart";
  db.query(sql, (err, data) => {
    if (err) return console.log("Cannot connect to Database...");
    return console.log("Database connected pour depart...");
  });
});