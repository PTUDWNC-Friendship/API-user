
const express = require("express");
const router = express.Router();
const UserModel = require("../models/user");
const mongoose = require("mongoose");
const constant = require("../utils/constant");
const bcrypt = require("bcrypt");
const modelGenerator = require('../utils/model-generator');
const jwtExtension = require("jsonwebtoken");
const passport = require("passport");
const url = require('url');

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
      data = { ...data, token: jwtExtension.sign(user.toJSON(), constant.JWT_SECRET) };
      return res.json(data);
      
    });
  })(req, res);
});

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
          const user = modelGenerator.createUser(username, hash, firstName, lastName, gender, null, null, "local", null, null, imgURL, "active");
          const objectStudent = modelGenerator.toUserObject(user);
          res.send(objectStudent);
        })
        .catch(err => {
          console.log(err);
        });
    }
  });
});

router.post("/update", (req, res) => {
  var { username, name, gender, password, picture, type } = req.body;
  const saltRounds = 10;
  UserModel.findOne({ username, type: type }).then(user => {
    if (user) {
      user.name = name;
      user.gender = gender;
      user.picture = picture;
      user.type = type;

      if (password === "" || type === "facebook" || type === "google") {
        user.save()
          .then(result => res.json(result) )
          .catch(err => console.log(err));
      } else {
        bcrypt
          .hash(password, saltRounds)
          .then(hash => {
            user.password = hash;
            user.save()
              .then(result => { res.json(result) })
              .catch(err => console.log(err));
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
  });
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
    (err, user) => {
      if (user) {
        res.redirect(url.format({
          pathname: `${constant.URL_CLIENT}/login`,
          query: user
        }));
      } else {
        return res.json({ message: err });
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
    { failureRedirect: "/login" },
    (err, user) => {
      if (user) {
        res.redirect(url.format({
          pathname: `${constant.URL_CLIENT}/login`,
          query: user
        }));
      } else {
        return res.json({ message: "Error occured" });
      }
    }
  )(req, res);
});

module.exports = router;