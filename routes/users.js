const express = require("express");
const router = express.Router();
const UserModel = require("../models/user");
const StudentModel = require("../models/student");
const ContractModel = require("../models/contract");
const TutorModel = require("../models/tutor");
const SubjectModel = require("../models/subject");
const FeedbackModel = require("../models/feedback");
const mongoose = require("mongoose");
const constant = require("../utils/constant");
const bcrypt = require("bcrypt");
const modelGenerator = require("../utils/model-generator");
const jwtExtension = require("jsonwebtoken");
const passport = require("passport");
const url = require("url");
const nodemailer = require("nodemailer");
const passwordGenerator = require('generate-password');

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
  if (result.role === 'student') {
    const student = await modelGenerator.toStudentObject(result);
    res.json(student);
  }
  else if (result.role === 'tutor') {
    const tutor = await modelGenerator.toTutorObject(result);
    res.json(tutor);
  }
  else {
    res.json(result);
  }
});

router.get("/get-all-tutors", async (req,res)=>{
  let tutors = await UserModel.find({role: "tutor"});
  let result = [];
  for (var tutor of tutors) {
    const temp = await modelGenerator.toTutorObject(tutor);

    const subjects = [];
    const feedbacks = [];
    for (var i = 0; i < temp.subjects.length; i+=1)
    {
      if (temp.subjects[i] !== '')
      {
        let subject = await SubjectModel.findOne({_id: temp.subjects[i]});
        subjects.push(subject);
      }
    }


    temp.subjects = subjects;
    let contractTutors = await ContractModel.find({_idTutor: tutor._id});
    let totalRate = 0 ;
    let amountContract = 0;
    for(let contract of contractTutors) {
      if(contract.status==='finished'&&contract._idFeedback!==null) {
        const feedback = await FeedbackModel.findOne({_id: contract._idFeedback});
        if(feedback!==null) {
          totalRate +=feedback.rate;
          amountContract +=1;
        }

        feedbacks.push(feedback);
      }

    }
    temp['feedbacks'] = feedbacks;
    if(amountContract>0) {
      temp.rate = totalRate/amountContract;
    } else {
      temp.rate = 0;
    }
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
    hiredTutors.forEach(async _idTutor => {
      if (_idTutor === idTutor) {
        const temp = await modelGenerator.toStudentObject(student);
        listStudents.push(temp);
      }
    })
  })
  res.json(listStudents);
})

router.get("/tutor/:idTutor/subjects",async  (req,res)=>{
  let { idTutor } = req.params;
  var listSubjects = [];
  let tutor = await TutorModel.findOne({_id: idTutor});
  const listSubjectsId = tutor.subjects;
  for(var item of listSubjectsId) {
    console.log('id', item);
    let subject = await SubjectModel.findOne({_id: item});
    listSubjects.push(subject);
  }
  res.json(listSubjects);
})

router.get("/tutor/:idTutor/feedbacks",async  (req,res)=>{
  let { idTutor } = req.params;
  var listFeedbacks = [];
  let tutor = await TutorModel.findOne({_id: idTutor});
  const listFeedbackId = tutor.feedback;
  for(var item of listFeedbackId) {
    let feedback = await FeedbackModel.findOne({_id: item});
    listFeedbacks.push(feedback);
  }
  res.json(listFeedbacks);
})

router.get("/student/:idStudent/hiredTutors",async  (req,res)=>{
  let { idStudent } = req.params;
  var listHiredTutors = [];
  let student = await StudentModel.findOne({_id: idTutor});
  const listHiredTutorId = student.hiredTutors;
  for(var item of listHiredTutorId) {
    let tutor = await TutorModel.findOne({_id: item});
    listHiredTutors.push(tutor);
  }
  res.json(listHiredTutors);
})

router.get("/api/:idStudent/tutors", async (req,res)=>{
  let { idStudent } = req.params;
  let listTutors = [];
  let student = await UserModel.findOne({_id: idStudent});
  student.hiredTutors.forEach(async idTutor => {
    const tutor =  TutorModel.findOne({_id: idTutor});
    const temp = await modelGenerator.toTutorObject(tutor);
    listTutors.push(temp);
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
            "notverified"
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

router.post("/verify", async (req, res) => {
  const { _id, username } = req.body;

  try {
    const token = jwtExtension
      .sign(JSON.stringify({ _id: _id }), constant.EMAIL_SECRET)
    const url = `${req.protocol}://${req.get("host")}/verification/${token}`;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: constant.USERNAME_EMAIL,
        pass: constant.PASSWORD_EMAIL
      }
    });
    var mainOptions = {
      from: "UberForTutor",
      to: username,
      subject: "[UberForTutor] - CONFIRM ACCOUNT",
      html: `Please click the link to confirm: <a href="${url}">${url}</a>
      <p>The link will be expired in 24h.</p>`
    };
    transporter.sendMail(mainOptions, function(error, info) {
      if (error) {
        res.json(error);
      } else {
        console.log("Message sent: " + info.response);
        res.json({ message: "Email was sent! Please open the verification link in your email! (Check Spam section if you can't find it)" });
      }
    });
  } catch (error) {
    res.json(error);
  }
});

router.post("/forgotpassword", async (req, res) => {
  const { username } = req.body;
  const saltRounds = 10;
  console.log(req.body);
  try {
    const user = await UserModel.findOne({username, type: 'local'});
    const rawPassword = passwordGenerator.generate({
      length: 8,
      uppercase: false,
      numbers: true
    });
    var hashPassword = await bcrypt.hash(rawPassword, saltRounds);
    if (user) {
      user.password = hashPassword;
    }

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: constant.USERNAME_EMAIL,
        pass: constant.PASSWORD_EMAIL
      }
    });
    var mainOptions = {
      from: "UberForTutor",
      to: username,
      subject: "[UberForTutor] - RESET YOUR PASSWORD",
      html: `<p>Your password is: <strong>${rawPassword}</strong></p>`
    };
    transporter.sendMail(mainOptions, function(error, info) {
      if (error) {
        res.json(error);
      } else {
        console.log("Message sent: " + info.response);
        user.save().catch(err => console.log(err));
        res.json({ message: "Email was sent! Please open your mail to get new password (Check you Spam Mailbox if you can't see in Inbox)" });
      }
    });
  } catch (error) {
    res.json(error);
  }
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
    modelGenerator.createTutor(user._id, "", 0, [], []);
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
      if (user[key] === req.body[key]||(key==="password")) continue;
      user[key] = req.body[key];
    }
    if (password === "" || type === "facebook" || type === "google") {
      user
        .save()
        .then(result => res.json(result))
        .catch(err => console.log(err));
    } else if (user.password !== req.body.password && req.body.password) {
      var hash = await bcrypt.hash(password, saltRounds);
      user.password = hash;
    }
    user
        .save()
        .then(result => {
          res.json(result);
        })
        .catch(err => console.log(err));
  }
});

router.post("/tutor/update", async (req, res) => {
  var { _id } = req.body;
  var tutor = await TutorModel.findById({ _id: _id });

  if (tutor) {
    for (var key in req.body) {
      if (tutor[key] === req.body[key]) continue;
      tutor[key] = req.body[key];
    }
    tutor
    .save()
    .then(result => {
      res.json(result);
    })
    .catch(err => console.log(err));
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
    tutor.feedback = tutor.feedback.concat(_idFeedback);
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
    tutor.subjects = tutor.subjects.concat(_idSubject);
    tutor
      .save()
      .then(result => {
        res.json(result);
      })
      .catch(err => console.log(err));
  }
});

router.post("/tutor/delete/subject", async (req, res) => {
  var { _id, _idSubject } = req.body;
  var tutor = await TutorModel.findById({ _id: _id });

  if (tutor) {
    if (tutor.subjects == null) {
      tutor.subjects = mongoose.Types.Array([]);
    }
    tutor.subjects = tutor.subjects.filter(item => item !== _idSubject);
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
          const query = {...user, _id: user._id.toString()};
          if (err) {
            res.send(err);
          }
          const redirectURL = url.format({
            pathname: `${constant.URL_CLIENT}/login`,
            query: query
          });
          res.redirect(redirectURL);
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
          const query = {...user, _id: user._id.toString()};
          if (err) {
            res.send(err);
          }
          const redirectURL = url.format({
            pathname: `${constant.URL_CLIENT}/login`,
            query: query
          });
          res.redirect(redirectURL);
        });
      } else {
        return res.json({ message: "Error occured", error });
      }
    }
  )(req, res);
});

module.exports = router;
