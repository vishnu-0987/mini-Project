const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const fs = require("fs");
const base64 = require("base64-stream");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData, createCanvas, loadImage } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

let db;

const dbPath = path.join(__dirname, "college.db");

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log(`Server is running at http://localhost:3001`);
    });
  } catch (e) {
    console.log(e.message);
  }
};

initializeDb();

const storageMuddi = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "mokam/"); // Directory where files will be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique file name
  },
});

const uploadMuddi = multer({ storage: storageMuddi });

const MODEL_URL = path.join(__dirname, "models");
const setupModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  console.log("Models loaded");
};

setupModels().catch((error) => {
  console.error("Error loading models:", error);
});

app.post("/api/recognize", uploadMuddi.single("image"), async (req, res) => {
  const imagePath = path.join(__dirname, req.file.path);
  const { dept, name } = req.body;

  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  try {
    // Check if the attendance is outside valid hours (7 AM to 4 PM)
    if (
      currentHour < 7 ||
      (currentHour === 16 && currentMinute > 0) ||
      currentHour > 21
    ) {
      return res
        .status(400)
        .json({ message: "Attendance is only allowed between 7 AM and 4 PM" });
    }

    console.log("Loading uploaded image...");
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);

    console.log("Detecting face...");
    const detections = await faceapi
      .detectSingleFace(canvas)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections) {
      const descriptor = detections.descriptor;
      console.log("Face descriptor obtained.");

      // Query faculty profile pics from database
      const query = `SELECT * FROM Faculty as f inner join Department as d on d.department_id=f.department_id where is_active=1 and (f.name=? and d.department_name=?)`;
      const resul = await db.all(query, [name, dept]);
      console.log("Processing faculty profile pics...");

      let matchedFaculty = null;

      // Process profile pictures in parallel
      const results = await Promise.all(
        resul.map(async (row) => {
          try {
            const profilePicPath = path.join(
              __dirname,
              "uploads",
              row.profile_pic
            );
            console.log(`Loading profile pic: ${profilePicPath}`);
            const profilePic = await loadImage(profilePicPath);
            const profilePicCanvas = createCanvas(
              profilePic.width,
              profilePic.height
            );
            const profilePicContext = profilePicCanvas.getContext("2d");
            profilePicContext.drawImage(profilePic, 0, 0);

            console.log("Detecting face in profile pic...");
            const profilePicDetections = await faceapi
              .detectSingleFace(profilePicCanvas)
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (profilePicDetections) {
              const profilePicDescriptor = profilePicDetections.descriptor;
              const faceMatcher = new faceapi.FaceMatcher([
                profilePicDescriptor,
              ]);
              const bestMatch = faceMatcher.findBestMatch(descriptor);

              if (bestMatch && bestMatch.distance < 0.6) {
                console.log("Match found.");
                matchedFaculty = row;

                return true;
              }
            }
            return false;
          } catch (error) {
            console.error("Error processing profile pic:", error);
            return false;
          }
        })
      );

      if (matchedFaculty) {
        console.log(matchedFaculty);
        const checkQuery = `
          SELECT * FROM Attendance 
          WHERE faculty_id = ? 
          AND DATE(attendance_date) = DATE('now')
        `;
        const existingRecord = await db.get(checkQuery, [
          matchedFaculty.faculty_id,
        ]);

        if (existingRecord) {
          res.json({ matchedFaculty, attendance: "Already recorded" });
        } else {
          const attQuery = `
            INSERT INTO Attendance (faculty_id) 
            VALUES(?)
          `;
          await db.run(attQuery, [matchedFaculty.faculty_id]);

          res.json({ matchedFaculty, attendance: "Recorded" });
        }
      } else {
        console.log("No matching faculty found");
        res.status(404).json({ message: "Face Not Matched" });
      }
    } else {
      res.status(404).json({ message: "No face detected" });
    }
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // Clean up uploaded file
    try {
      console.log("removing pic");
      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  }
});

app.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM admin WHERE email = ?`;
  const result = await db.get(query, [email]);

  if (result === undefined) {
    res.status(401).json({ err: "Invalid Email" });
  } else {
    const isPassword = await bcrypt.compare(password, result.password);
    if (!isPassword) {
      res.status(401).json({ err: "Incorrect Password" });
    } else {
      const payload = {
        id: result.admin_id,
        username: result.username,
        name: result.name,
        role: result.role,
        department: result.department,
        profilePic: result.profilePic,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      res.status(200).json({ jwt: jwtToken, user: payload });
    }
  }
});
app.post("/facultylogin", async (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM Faculty WHERE email = ?`;
  const result = await db.get(query, [email]);

  if (result === undefined) {
    res.status(401).json({ err: "Invalid Email" });
  } else {
    const isPassword = await bcrypt.compare(password, result.password);
    if (!isPassword) {
      res.status(401).json({ err: "Incorrect Password" });
    } else {
      const payload = {
        name: result.name,
        faculty_id: result.faculty_id,
        id: result.faculty_id,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      res.status(200).json({ jwt: jwtToken, user: payload });
    }
  }
});

app.post("/get-profile-pic", async (req, res) => {
  const { admin, id } = req.body;
  let query;
  if (admin) {
    query = `
      select profilePic as profile_pic from admin where admin_id=?
    `;
  } else {
    query = `
    select profile_pic from Faculty where faculty_id=?
  `;
  }

  const result = await db.get(query, [id]);
  res.status(200).json({ pic: result.profile_pic });
});

app.post("/get-profile-details", async (req, res) => {
  const { admin, id } = req.body;
  let query;
  if (admin) {
    query = `
        SELECT * FROM Admin where admin_id=?
      `;
    const resAdmin = await db.get(query, [id]);
    res.status(200).json({ data: resAdmin });
  } else {
    query = `
        SELECT * FROM Faculty as f
        inner join  Department as d on f.department_id=d.department_id
        where f.faculty_id=?
      `;
    const resFaculty = await db.get(query, [id]);
    res.status(200).json({ data: resFaculty });
  }
});

app.get("/faculty-data/:faculty_id", async (req, res) => {
  const { faculty_id } = req.params;
  try {
    const query = "SELECT * FROM Faculty WHERE faculty_id = ?";
    const result = await db.get(query, [faculty_id]);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(401).json({ err: error.message });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory where files will be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique file name
  },
});

const upload = multer({ storage: storage });

app.post("/adminregister", upload.single("profilePic"), async (req, res) => {
  try {
    const { email, password, name, username, role, dept } = req.body;
    const profilePic = req.file ? req.file.filename : null; // Handle file if available

    // Check for existing email
    const queryEmail = `SELECT * FROM admin WHERE email = ?`;
    const isEmail = await db.get(queryEmail, [email]);
    if (isEmail !== undefined) {
      return res.status(409).json({ err: "Email Already Exists" });
    }

    // Check for existing username
    const queryUsername = `SELECT * FROM admin WHERE username = ?`;
    const isUsername = await db.get(queryUsername, [username]);
    if (isUsername !== undefined) {
      return res.status(409).json({ err: "Username is already taken" });
    }

    // Encrypt password
    const encryptPass = await bcrypt.hash(password, 12);

    // Insert new admin data into the database
    const query = `
      INSERT INTO admin(email, password, name, username, role, department, profilePic)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.run(query, [
      email,
      encryptPass,
      name,
      username,
      role,
      dept,
      profilePic, // Include profile picture filename
    ]);

    res
      .status(201)
      .json({ message: "Registration successful", adminId: result.lastID });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ err: "Internal Server Error" });
  }
});

app.post(
  "/profile-completion",
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const { bio, goals, start_date, faculty_id } = req.body;
      const profilePic = req.file ? req.file.filename : null;

      if (!profilePic) {
        return res
          .status(400)
          .json({ message: "Profile picture is required." });
      }

      const query = `
      UPDATE Faculty
      SET bio = ?, goals = ?, start_date = ?, profile_pic = ?, is_registered = 1, is_active = 1
      WHERE faculty_id = ?;
    `;

      const result = await db.run(query, [
        bio,
        goals,
        start_date,
        profilePic,
        faculty_id,
      ]);

      if (result.changes > 0) {
        res
          .status(200)
          .json({ message: "Profile successfully updated", pic: profilePic });
      } else {
        res.status(404).json({ message: "Faculty not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ err: "Internal Server Error" });
    }
  }
);

app.post("/add-faculty", async (req, res) => {
  const { name, email, department_name } = req.body;

  console.log(department_name);
  // Generate a temporary password

  const deptFinder = `
    select department_id from Department where department_name=?
  `;
  const deptIdRes = await db.get(deptFinder, [department_name]);

  const tempPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Create the new faculty entry
  try {
    const query = `
      INSERT INTO Faculty (name, email, password, department_id)
      VALUES (?, ?, ?, ?)
    `;
    const result = await db.run(query, [
      name,
      email,
      hashedPassword,
      deptIdRes.department_id,
    ]);

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "cjvishnuprakash@gmail.com",
        pass: "nyrp rbov dwzy dvzg",
      },
    });

    const mailOptions = {
      from: "cjvishnuprakash@gmail.com",
      to: email,
      subject: "Welcome to CMR COLLEGE OF ENGINEERING & TECHNOLOGY",
      text: `Dear ${name},\n\nYou have been added as a faculty member at [CMR COLLEGE OF ENGINEERING & TECHNOLOGY].\n\nYour temporary login credentials are:\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease log in and update your profile.\n\nBest Regards,\n[CMR COLLEGE OF ENGINEERING & TECHNOLOGY]`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Faculty added and email sent!" });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: "Error adding faculty", error });
  }
});

app.get("/faculty/total-employees", async (req, res) => {
  const query = `
    select count(*) as tot from faculty
  `;
  const resp = await db.get(query);
  res.status(200).json({ tot: resp.tot });
});

app.get("/faculty/active-employees", async (req, res) => {
  const query = `
    select count(*) as tot from faculty where is_active = 1;

  `;
  const resp = await db.get(query);
  res.status(200).json({ tot: resp.tot });
});

app.get("/faculty/department-wise-count", async (req, res) => {
  const query = `
    SELECT 
    d.department_name as dept_name, 
    COUNT(f.faculty_id) AS faculty_count
FROM 
    Department d
LEFT JOIN 
    Faculty f 
ON 
    d.department_id = f.department_id
GROUP BY 
    d.department_name;
  `;

  const data = await db.all(query);
  res.status(200).json({ dept: data });
});

app.get("/faculty/staff-profiles/:dept", async (req, res) => {
  const { dept } = req.params; // Corrected destructuring
  let query;
  let params = [];

  if (dept === "ALL") {
    query = `
    SELECT f.name AS name,
           f.email AS email,
           d.department_name AS department_name,
           f.profile_pic AS profile_pic,
           f.is_active AS is_active,
           f.is_registered AS is_registered 
    FROM Faculty AS f 
    INNER JOIN Department AS d ON f.department_id = d.department_id
    `;
  } else {
    query = `
    SELECT f.name AS name,
           f.email AS email,
           d.department_name AS department_name,
           f.profile_pic AS profile_pic,
           f.is_active AS is_active,
           f.is_registered AS is_registered 
    FROM Faculty AS f 
    INNER JOIN Department AS d ON f.department_id = d.department_id
    WHERE d.department_name = ?
    `;
    params.push(dept); // Add the department name to the parameters array
  }

  try {
    const data = await db.all(query, params); // Execute the query with parameters
    res.status(200).json({ profiles: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff profiles" });
  }
});

app.get("/faculty/names/:dept", async (req, res) => {
  const dept = req.params.dept;
  const query = `
  select s.name as name from Faculty as s 
  inner join Department as d on s.department_id=d.department_id
  where d.department_name=?
  `;

  const result = await db.all(query, [dept]);
  console.log(result);
  res.status(200).json({ resp: result });
});

app.post("/remove-faculty", async (req, res) => {
  const { name } = req.body;
  const query = `
    delete from Faculty where name=?
  `;

  try {
    const resp = await db.run(query, [name]);
    res.status(200).json({ msg: "Success" });
  } catch (error) {
    res.status(401).json({ msg: "error" });
  }
});

app.post("/modify-faculty", async (req, res) => {
  const { email, name } = req.body;
  const query = `
    update Faculty set email=? where name=?
  `;

  try {
    const resp = await db.run(query, [email, name]);
    res.status(200).json({ msg: "Success" });
  } catch (error) {
    res.status(401).json({ msg: "error" });
  }
});

app.get("/leave-requests/:faculty_id", async (req, res) => {
  const facultyId = req.params.faculty_id;

  try {
    const leaveRequests = await db.all(
      "SELECT * FROM LeaveRequest WHERE faculty_id = $1 ORDER BY created_at DESC",
      [facultyId]
    );
    res.json({ leaveRequests });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

app.post("/faculty/leave-request/:faculty_id", async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  const facultyId = req.params.faculty_id;

  try {
    const newLeaveRequest = await db.run(
      "INSERT INTO LeaveRequest (faculty_id, leave_type, start_date, end_date, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [facultyId, leaveType, startDate, endDate, reason]
    );
    res
      .status(201)
      .json({ msg: "Request submitted", request: newLeaveRequest });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({ error: "Failed to submit leave request" });
  }
});

app.get("/faculty/all-leave-requests", async (req, res) => {
  try {
    const leaveRequests = await db.all(
      "SELECT * FROM LeaveRequest as l inner join Faculty as f on f.faculty_id=l.faculty_id where status='Pending' ORDER BY created_at DESC"
    );
    res.json({ requests: leaveRequests });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

app.get("/leave-request/approve/:request_id", async (req, res) => {
  const requestId = req.params.request_id;

  try {
    await db.run("UPDATE LeaveRequest SET status = 'Approved' WHERE id = $1", [
      requestId,
    ]);
    res.json({ message: "Leave request approved" });
  } catch (error) {
    console.error("Error approving leave request:", error);
    res.status(500).json({ error: "Failed to approve leave request" });
  }
});

app.get("/leave-request/reject/:request_id", async (req, res) => {
  const requestId = req.params.request_id;

  try {
    await db.run("UPDATE LeaveRequest SET status = 'Rejected' WHERE id = $1", [
      requestId,
    ]);
    res.json({ message: "Leave request rejected" });
  } catch (error) {
    console.error("Error rejecting leave request:", error);
    res.status(500).json({ error: "Failed to reject leave request" });
  }
});

app.post("/faculty/assign-tasks", async (req, res) => {
  const { name, assignmentHeading, assignmentDescription, perkPoints } =
    req.body;

  const { faculty_id } = await db.get(
    `
        select faculty_id from Faculty where name=?
      `,
    [name]
  );

  const insertQuery = `
      INSERT INTO assignments (faculty_id, assignment_heading, assignment_description, perk_points)
      VALUES (?, ?, ?, ?)
    `;

  await db.run(insertQuery, [
    faculty_id,
    assignmentHeading,
    assignmentDescription,
    perkPoints,
  ]);

  // Respond with success
  res.status(200).json({ message: "Task assigned successfully" });
});

app.get("/faculty/previous-tasks", async (req, res) => {
  try {
    const previousTasks = await db.all(
      "SELECT * FROM assignments as a inner join Faculty as f on f.faculty_id=a.faculty_id where status='Completed' or status='Submitted' ORDER BY created_at DESC"
    );
    res.json({ requests: previousTasks });
  } catch (error) {
    console.error("Error fetching previous tasks:", error);
    res.status(500).json({ error: "Failed to fetch previous tasks" });
  }
});

app.get("/faculty/all-additional-tasks/:id", async (req, res) => {
  const facultyId = req.params.id;
  console.log(facultyId);
  try {
    const tasks = await db.all(
      `SELECT * FROM assignments as l inner join Faculty as f on f.faculty_id=l.faculty_id where l.faculty_id=? and (l.status="Pending" or l.status="Started Doing") ORDER BY created_at DESC`,
      [facultyId]
    );
    res.json({ requests: tasks });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

app.get("/faculty/all-completed-tasks/:id", async (req, res) => {
  const facultyId = req.params.id;
  console.log(facultyId);
  try {
    const tasks = await db.all(
      `SELECT * FROM assignments as l inner join Faculty as f on f.faculty_id=l.faculty_id where l.faculty_id=? and (l.status="Completed" or l.status="Submitted") ORDER BY created_at DESC`,
      [facultyId]
    );
    res.json({ requests: tasks });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

app.get("/additional-request/approve/:request_id", async (req, res) => {
  const requestId = req.params.request_id;

  try {
    await db.run(
      "UPDATE assignments SET status = 'Started Doing' WHERE id = $1",
      [requestId]
    );
    res.json({ message: "Started Doing Assigment" });
  } catch (error) {
    console.error("Error approving leave request:", error);
    res.status(500).json({ error: "Failed to approve leave request" });
  }
});

app.get("/additional-request/reject/:request_id", async (req, res) => {
  const requestId = req.params.request_id;
  console.log(requestId);

  try {
    await db.run("UPDATE assignments SET status = 'Ignored' WHERE id = $1", [
      requestId,
    ]);

    res.json({ message: "Leave request rejected" });
  } catch (error) {
    console.error("Error rejecting leave request:", error);
    res.status(500).json({ error: "Failed to reject leave request" });
  }
});

app.get("/additional-request/submit/:request_id", async (req, res) => {
  const requestId = req.params.request_id;
  console.log(requestId);

  try {
    await db.run("UPDATE assignments SET status = 'Submitted' WHERE id = $1", [
      requestId,
    ]);
    res.json({ message: "Assignment Submitted" });
  } catch (error) {
    console.error("Error rejecting leave request:", error);
    res.status(500).json({ error: "Failed to reject leave request" });
  }
});

app.get("/review/:request_id/:faculty_id/:points", async (req, res) => {
  const requestId = req.params.request_id;
  const facultyId = req.params.faculty_id;
  const points = parseInt(req.params.points, 10);
  console.log(points);

  try {
    // Update the assignment status
    await db.run("UPDATE assignments SET status = 'Completed' WHERE id = $1", [
      requestId,
    ]);

    // Check if the faculty already has perks in the FacultyPerks table
    const result = await db.get(
      "SELECT total_perks FROM FacultyPerks WHERE faculty_id = $1",
      [facultyId]
    );

    if (result) {
      // If faculty_id exists, update the total_perks by adding points
      await db.run(
        "UPDATE FacultyPerks SET total_perks = total_perks + $1 WHERE faculty_id = $2",
        [points, facultyId]
      );
    } else {
      // If faculty_id doesn't exist, insert a new row
      await db.run(
        "INSERT INTO FacultyPerks (faculty_id, total_perks) VALUES ($1, $2)",
        [facultyId, points]
      );
    }

    res.json({ message: "Assignment completed and perks updated" });
  } catch (error) {
    console.error("Error completing assignment or updating perks:", error);
    res
      .status(500)
      .json({ error: "Failed to complete assignment or update perks" });
  }
});

app.get("/api/attendance/:year/:month/:day", async (req, res) => {
  const { year, month, day } = req.params;
  const date = `${year}-${month}-${day}`;

  const query = `
    SELECT f.faculty_id, f.name as faculty_name,
           CASE
             WHEN a.attendance_time IS NOT NULL THEN 'Present'
             ELSE 'Absent'
           END as status
    FROM Faculty f
    LEFT JOIN Attendance a
      ON f.faculty_id = a.faculty_id
      AND DATE(a.attendance_time) = ?
    WHERE a.attendance_time IS NULL
    OR DATE(a.attendance_time) = ?
    GROUP BY f.faculty_id
    ORDER BY f.faculty_id
  `;

  try {
    const result = await db.all(query, [date, date]);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/attendance", async (req, res) => {
  const query = await db.all(
    `
    SELECT Faculty.name, COUNT(*) AS total_attendance
    FROM Attendance
    JOIN Faculty ON Attendance.faculty_id = Faculty.faculty_id
    GROUP BY Faculty.faculty_id, Faculty.name
  `
  );

  res.json(query);
});

app.get("/api/attendance-distribution", async (req, res) => {
  try {
    // SQL query to get counts of faculty attendance statuses for today
    const query = `
      SELECT
    CASE
        WHEN a.attendance_time IS NOT NULL THEN 'Present'
        ELSE 'Absent'
    END AS status,
    COUNT(f.faculty_id) AS count
FROM Faculty f
LEFT JOIN Attendance a
    ON f.faculty_id = a.faculty_id
    AND DATE(a.attendance_date) = DATE('now')
GROUP BY status;

    `;

    // Execute the query
    const result = await db.all(query);

    // Format the result to include counts for Present, Half Day, and Absent
    const statusCount = result.reduce(
      (acc, record) => {
        acc[record.status] = record.count;
        return acc;
      },
      { Present: 0, "Half Day": 0, Absent: 0 }
    );

    // Send the result as JSON
    res.status(200).json(statusCount);
  } catch (error) {
    // Handle errors
    console.error("Error fetching attendance distribution data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/all-perks-points", async (req, res) => {
  const query = await db.all(
    `
    SELECT Faculty.name, COALESCE(FacultyPerks.total_perks, 0) as total_perks
    FROM Faculty
    LEFT JOIN FacultyPerks ON Faculty.faculty_id = FacultyPerks.faculty_id
    order by FacultyPerks.total_perks desc
    `
  );
  res.json(query);
});

app.get("/api/attendance-by-date", async (req, res) => {
  const query = await db.all(
    `
    SELECT DATE(attendance_time) AS date, COUNT(*) AS total_attendance
    FROM Attendance
    GROUP BY DATE(attendance_time)
  `
  );
  // res.send(query);
  res.json(query);
});

module.exports = app;
