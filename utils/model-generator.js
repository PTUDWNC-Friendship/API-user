const UserModel = require('../models/user');
const StudentModel = require('../models/student');
const TutorModel = require('../models/tutor');
const SubjectModel = require('../models/subject');
const TagModel = require('../models/tag');
const TagSubjectModel = require('../models/tag-subject');
const mongoose = require('mongoose');

module.exports = {
    createUser: (username, password, firstName, lastname, gender, address, phone, type, role, bio, imageURL, status) => {
        var user = new UserModel({
            _id: new mongoose.Types.ObjectId(),
            username: username,
            password: password,
            firstName: firstName,
            lastname: lastname,
            gender: gender,
            address: address,
            phone: phone,
            type: type,
            role: role,
            bio: bio,
            imageURL: imageURL,
            status: status
        })
        user.save().then(result => { return result; }).catch(error => { console.log(error) })
        return user._doc;
    },
    createStudent: (_id, hiredTutors) => {
        var student = new StudentModel({
            _id: _id,
            hiredTutors: hiredTutors
        })
        student.save().catch(error => console.log(error));
        return student;
    },
    createTutor: (_id, title, price, subjects, feedback) => {
        var tutor = new TutorModel({
            _id: _id,
            title: title,
            price: price,
            subjects: subjects,
            feedback: feedback
        });
        tutor.save().catch(error => console.log(error));
        return tutor;
    },
    createSubject: (name, category, description) => {
        var subject = new SubjectModel({
            _id: new mongoose.Types.ObjectId(),
            name: name,
            category: category,
            description: description
        })
        subject.save().then(result => { return result; }).catch(error => { console.log(error) })
        return subject._doc;
    },
    createTagSubject: (_idTag, _idSubject) => {
        var tagSubject = new TagSubjectModel({
            _id: new mongoose.Types.ObjectId(),
            _idTag: _idTag,
            _idSubject: _idSubject
        })
        tagSubject.save().then(result => { return result; }).catch(error => { console.log(error) })
        return tagSubject._doc;
    },
    createTag: (name) => {
        var tag = new TagModel({
            _id: new mongoose.Types.ObjectId(),
            name: name
        })
        tag.save().then(result => { return result; }).catch(error => { console.log(error) })
        return tag._doc;
    },
    toUserObject: (user) => {
        return {
            _id: user._id,
            username: user.username,
            password: user.password,
            firstName: user.firstName,
            lastname: user.lastname,
            gender: user.gender,
            address: user.address,
            phone: user.phone,
            type: user.type,
            role: user.role,
            bio: user.bio,
            imageURL: user.imageURL,
            status: user.status,
        }
    },
    toStudentObject: (_student) => {
        UserModel.findById({_id: _student._id})
        .then(student => {
            var object = {
                _id: student._id,
                username: student.username,
                password: student.password,
                firstName: student.firstName,
                lastname: student.lastname,
                gender: student.gender,
                address: student.address,
                phone: student.phone,
                type: student.type,
                role: student.role,
                bio: student.bio,
                imageURL: student.imageURL,
                status: student.status,
                hiredTutors: _student.hiredTutors
            }
            return object;
        })
        .catch(error => console.log(error));
        return null;
    },
    toTutorObject: (_tutor) => {
        UserModel.findById({_id: _tutor._id})
        .then(tutor => {
            var object = {
                _id: tutor._id,
                username: tutor.username,
                password: tutor.password,
                firstName: tutor.firstName,
                lastname: tutor.lastname,
                gender: tutor.gender,
                address: tutor.address,
                phone: tutor.phone,
                type: tutor.type,
                role: tutor.role,
                bio: tutor.bio,
                imageURL: tutor.imageURL,
                status: tutor.status,
                title: _tutor.title,
                price: _tutor.price,
                subjects: _tutor.subjects,
                feedback: _tutor.feedback
            }
            return object;
        })
        .catch(error => console.log(error));
        return null;
    },
    toSubjectObject: (_subject) => {
        SubjectModel.findById({_id: _subject._id})
            .then(subject => {
                var object = {
                    _id: subject._id,
                    name: subject.name,
                    category: subject.category,
                    description: subject.description,
                    tags: subject.tags
                }
                return object;
            })
    },
    toTagObject: (_tag) => {
        TagModel.findById({_id: _tag._id})
            .then(tag => {
                var object = {
                    _id: tag._id,
                    name: tag.name,
                }
                return object;
            })
    }
}