const constant = require('../utils/constant');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwtExtension = require('jwt-simple');
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
    callbackURL: "/user/facebook/redirect",
    profileFields: ['id', 'displayName', 'photos', 'email', 'gender']
},
    function (accessToken, refreshToken, profile, done) {
        const { emails, displayName, photos, gender } = profile;
        // console.log(profile);
        UserModel.findOne({ username: emails[0].value, type: "facebook" })
            .then(user => {
                if(user) {
                    let _user = {
                        username: user.username,
                        name: user.name,
                        picture: user.picture,
                        gender: user.gender,
                        type: user.type
                    };
                    _user = {..._user, token: jwtExtension.encode(_user, constant.JWT_SECRET)}
                    // console.log(_user);
                    return done(null, _user);
                }
                else {
                    const newUser = new UserModel({
                        _id: new mongoose.Types.ObjectId(),
                        username: emails[0].value,
                        gender: gender,
                        name: displayName,
                        type: "facebook",
                        picture: photos[0].value
                    })

                    newUser.save()
                        .then(result => {
                            const _user = {
                                username: result.username,
                                name: result.name,
                                gender: result.gender,
                                type: result.type,
                                picture: result.picture,
                            };
                            _user = {..._user, token: jwtExtension.encode(_user, constant.JWT_SECRET)}
                            // console.log(_user);
                            done(null, _user)
                        })
                        .catch(err => console.log(err));                    
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
        // console.log(tokenInfo);
        const { emails, displayName, photos } = profile;
        UserModel.findOne({ username: emails[0].value, type: "google" })
            .then(user => {
                if(user) {
                    const _user = {
                        username: user.username,
                        name: user.name,
                        gender: user.gender,
                        picture: user.picture,
                        type: user.type,
                        token: tokenInfo.id_token
                    };
                    console.log(_user);
                    return done(null, _user);
                }
                else {
                    const newUser = new UserModel({
                        _id: new mongoose.Types.ObjectId(),
                        username: emails[0].value,
                        name: displayName,
                        type: "google",
                        gender: "",
                        picture: photos[0].value
                    })

                    newUser.save()
                        .then(result => {
                            const _user = {
                                username: result.username,
                                name: result.name,
                                gender: result.gender,
                                picture: result.picture,
                                type: result.type,
                                token: tokenInfo.id_token
                            };
                            console.log(_user);
                            done(null, _user)
                        })
                        .catch(err => console.log(err));                    
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