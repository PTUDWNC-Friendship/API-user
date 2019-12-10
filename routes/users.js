const express = require("express");
const router = express.Router();
const UserModel = require("../models/user");
const StudentModel = require("../models/student");
const TutorModel = require("../models/tutor");
const mongoose = require("mongoose");
const constant = require("../utils/constant");
const bcrypt = require("bcrypt");
const modelGenerator = require("../utils/model-generator");
const jwtExtension = require("jsonwebtoken");
const passport = require("passport");
const url = require("url");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : "Login failed",
        user: user
      });
    }
    req.login(user, { session: false }, err => {
      if (err) {
        res.send(err);
      }

      var data = modelGenerator.toUserObject(user);
      data = {
        ...data,
        token: jwtExtension.sign(user.toJSON(), constant.JWT_SECRET)
      };
      return res.json(data);
    });
  })(req, res);
});

router.get("/api", async (req, res) => {
  let list = await UserModel.find();
  res.json(list);
});

router.get("/api/:id", async (req, res) => {
  let { id } = req.params;
  let result = await UserModel.findOne({_id: id});
  res.json(result);
});

router.get("/get-all-tutors", async (req,res)=>{
  let tutors = await UserModel.find({role: "tutor"});
  let result = [];
  for (var tutor of tutors) {
    const temp = await modelGenerator.toTutorObject(tutor);
    result.push(temp);
  }
  res.json(result);
})

router.get("/get-all-students", async (req,res)=>{
  let students = await UserModel.find({role: "student"});
  let result = [];
  for (var student of students) {
    const temp = await modelGenerator.toStudentObject(student);
    result.push(temp);
  }
  res.json(result);
})

router.get("/api/:idTutor/students", async (req,res)=>{
  let { idTutor } = req.params;
  var listStudents = [];
  let students = await UserModel.find({role: "student"});
  students.forEach(student => {
    var hiredTutors = student.hiredTutors;
    hiredTutors.forEach(_idTutor => {
      if (_idTutor === idTutor) {
        listStudents.push(modelGenerator.toStudentObject(student));
      }
    })
  })
  res.json(listStudents);
})

router.get("/api/:idStudent/tutors", async (req,res)=>{
  let { idStudent } = req.params;
  let listTutors = [];
  let student = await UserModel.findOne({_id: idStudent});
  student.hiredTutors.forEach(idTutor => {
    const tutor =  TutorModel.findOne({_id: idTutor});
    listTutors.push(modelGenerator.toTutorObject(tutor));
  })
  res.json(listStudents);
})

router.post("/register", (req, res) => {
  var { username, firstName, lastName, gender, password } = req.body;
  var imgURL = `${req.protocol}://${req.get("host")}/images/no-avatar.png`;
  const saltRounds = 10;

  UserModel.findOne({ username: username, type: "local" }).then(user => {
    if (user) {
      res.json({ message: "Username has already existed" });
    } else {
      bcrypt
        .hash(password, saltRounds)
        .then(hash => {
          const user = modelGenerator.createUser(
            username,
            hash,
            firstName,
            lastName,
            gender,
            null,
            null,
            "local",
            null,
            null,
            imgURL,
            "active"
          );
          const objectStudent = modelGenerator.toUserObject(user);
          res.send(objectStudent);
        })
        .catch(err => {
          console.log(err);
        });
    }
  });
});

router.post("/student/register", async (req, res) => {
  var user = await UserModel.findById({ _id: req.body._id });
  if (user) {
    user.role = "student";
    user.save().catch(err => console.log(err));
    modelGenerator.createStudent(user._id, null);
    const data = modelGenerator.toUserObject(user);
    res.json(data);
  }
});

router.post("/tutor/register", async (req, res) => {
  var user = await UserModel.findById({ _id: req.body._id });
  if (user) {
    user.role = "tutor";
    user.save().catch(err => console.log(err));
    modelGenerator.createTutor(user._id, null, null, null, null);
    const data = modelGenerator.toUserObject(user);
    res.json(data);
  }
});

router.post("/update", async (req, res) => {
  var { _id, password, type } = req.body;
  const saltRounds = 10;
  var user = await UserModel.findById({ _id: _id });

  if (user) {
    for (var key in req.body) {
      if (user[key] === req.body[key]) continue;
      user[key] = req.body[key];
    }
    if (password === "" || type === "facebook" || type === "google") {
      user
        .save()
        .then(result => res.json(result))
        .catch(err => console.log(err));
    } else {
      var hash = await bcrypt.hash(password, saltRounds);
      user.password = hash;
      user
        .save()
        .then(result => {
          res.json(result);
        })
        .catch(err => console.log(err));
    }
  }
});

router.post("/tutor/update", async (req, res) => {
  var { _id } = req.body;
  var tutor = await TutorModel.findById({ _id: _id });

  if (tutor) {
    for (var key in req.body) {
      if (tutor[key] === req.body[key]) continue;
      tutor[key] = req.body[key];

      tutor
        .save()
        .then(result => {
          res.json(result);
        })
        .catch(err => console.log(err));
    }
  }
});

router.post("/student/insert/hired-tutors", async (req, res) => {
  var { _id, _idTutor } = req.body;
  var student = await StudentModel.findById({ _id: _id });

  if (student) {
    if (student.hiredTutors == null) {
      student.hiredTutors = mongoose.Types.Array([]);
    }
    student.hiredTutors = student.hiredTutors.concat(_idTutor);
    student
      .save()
      .then(result => {
        res.json(result);
      })
      .catch(err => console.log(err));
  }
});

router.post("/tutor/insert/feedback", async (req, res) => {
  var { _id, _idFeedback } = req.body;
  var tutor = await TutorModel.findById({ _id: _id });

  if (tutor) {
    if (tutor.feedback == null) {
      tutor.feedback = mongoose.Types.Array([]);
    }
    tutor.feedback = student.feedback.concat(_idFeedback);
    tutor
      .save()
      .then(result => {
        res.json(result);
      })
      .catch(err => console.log(err));
  }
});

router.post("/tutor/insert/subject", async (req, res) => {
  var { _id, _idSubject } = req.body;
  var tutor = await TutorModel.findById({ _id: _id });

  if (tutor) {
    if (tutor.subjects == null) {
      tutor.subjects = mongoose.Types.Array([]);
    }
    tutor.subjects = student.subjects.concat(_idSubject);
    tutor
      .save()
      .then(result => {
        res.json(result);
      })
      .catch(err => console.log(err));
  }
});

// ==== GOOGLE ====
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get("/google/redirect", (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    (error, user) => {
      if (user) {
        req.login(user, { session: false }, err => {
          if (err) {
            res.send(err);
          }
          res.redirect(
            url.format({
              pathname: `${constant.URL_CLIENT}/login`,
              query: user
            })
          );
        });
      } else {
        return res.json({ message: "Error occured", error });
      }
    }
  )(req, res);
});

// ==== FACEBOOK ====
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "user_photos"]
  })
);

router.get("/facebook/redirect", (req, res, next) => {
  passport.authenticate(
    "facebook",
    {
      successRedirect: `${constant.URL_CLIENT}`,
      failureRedirect: `${constant.URL_CLIENT}`
    },
    (error, user) => {
      if (user) {
        req.login(user, { session: false }, err => {
          if (err) {
            res.send(err);
          }
          res.redirect(
            url.format({
              pathname: `${constant.URL_CLIENT}/login`,
              query: user
            })
          );
        });
      } else {
        return res.json({ message: "Error occured", error });
      }
    }
  )(req, res);
});

module.exports = router;
