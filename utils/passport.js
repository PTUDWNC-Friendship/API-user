const constant = require('../utils/constant');
const modelGenerator = require('../utils/model-generator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwtExtension = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require("passport-jwt");
const passportLocal = require('passport-local');
const passportGoogle = require('passport-google-oauth');
const passportFacebook = require('passport-facebook');

const FacebookStrategy = passportFacebook.Strategy;
const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const GoogleStrategy = passportGoogle.OAuth2Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const UserModel = require('../models/user');
const StudentModel = require('../models/student');
const TutorModel = require('../models/tutor');

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// === FACEBOOK ===
const facebook = new FacebookStrategy({
    clientID: constant.FACEBOOK_APP_ID,
    clientSecret: constant.FACEBOOK_APP_SECRET,
    profileFields: ['id', 'displayName', 'first_name', 'last_name', 'photos', 'email', 'gender']
},
    function (accessToken, refreshToken, profile, done) {
        const { emails, firstName, lastName, photos, gender } = profile;
        UserModel.findOne({ username: emails[0].value, type: "facebook" })
            .then(user => {
                if(user) {
                    let _user = modelGenerator.toUserObject(user);
                    _user = {..._user, token: jwtExtension.sign(JSON.stringify(_user), constant.JWT_SECRET)}
                    console.log("EXISTS === : " ,_user);
                    // return done(null, _user);
                }
                else {
                    let _user = modelGenerator.createUser(emails[0].value, "", firstName, lastName, gender, null, null, "facebook", null, null, photos[0].value, "active");
                    _user = { ..._user, token: jwtExtension.sign(JSON.stringify(_user), constant.JWT_SECRET)};
                    console.log(_user);
                    // return done(null, _user)                   
                }
            })
            .catch(err => {
                return done(err);
            })
    }
);

const google = new GoogleStrategy({
    clientID: constant.GOOGLE_CLIENT_ID,
    clientSecret: constant.GOOGLE_CLIENT_SECRET,
    callbackURL: "/user/google/redirect"
    },
    function (accessToken, refreshToken, tokenInfo, profile, done) {
        const { emails, name, photos } = profile;
        console.log(name.givenName);
        UserModel.findOne({ username: emails[0].value, type: "google" })
            .then(user => {
                if(user) {
                    let _user = modelGenerator.toUserObject(user);
                    _user = { ..._user, token: jwtExtension.sign(JSON.stringify(_user), constant.JWT_SECRET) }
                    return done(null, _user);
                }
                else {
                    let _user = modelGenerator.createUser(emails[0].value, "", name.familyName, name.givenName, "male", null, null, "google", null, null, photos[0].value, "active");          
                    _user = { ..._user, token: jwtExtension.sign(JSON.stringify(_user), constant.JWT_SECRET) }
                    return done(null, _user);
                }
            })
            .catch(err => {
                return done(err);
            })
    }
);

const jwt = new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: constant.JWT_SECRET
},
    function (jwtPayload, done) {
        return UserModel.findById(jwtPayload._id)
            .then(user => {
                return done(null, user);
            })
            .catch(err => {
                return done(err);
            });
    }
);

const local = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    function (username, password, done) {
        return UserModel.findOne({username: username, type: "local"})
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'Incorrect username!' });
                }
                bcrypt.compare(password, user.password)
                    .then(result => {
                        if (result) {
                            return done(null, user, { message: 'Logged In Successfully' });
                        } else {
                            return done(null, false, { message: 'Incorrect password!' });
                        }
                    })
            })
            .catch(err => done(err));
    }
);

passport.use(jwt);
passport.use(local);
passport.use(google);
passport.use(facebook);