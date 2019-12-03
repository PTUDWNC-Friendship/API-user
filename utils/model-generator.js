const UserModel = require('../models/user');
const StudentModel = require('../models/student');
const TutorModel = require('../models/tutor');
const SubjectModel = require('../models/subject');

module.exports = {
    createUser: (username, password, lastname, gender, address, phone, type, role, bio, imageURL, status) => {
        var user = new UserModel({
            _id: new mongoose.Types.ObjectId(),
            username: username,
            password: password,
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
        user.save().catch(error => { console.log})
        return user;
    },
    createStudent: (username, password, lastname, gender, address, phone, type, role, bio, imageURL, status, hiredTutors) => {
        var user = this.createUser(username, password, lastname, gender, address, phone, type, role, bio, imageURL, status);
        var student = new StudentModel({
            _id: user._id,
            hiredTutors: hiredTutors
        })
        student.save().catch(error => console.log(error));
        return student;
    },
    createTutor: (username, password, lastname, gender, address, phone, type, role, bio, imageURL, status, title, price, subjects, feedback) => {
        var user = this.createUser(username, password, lastname, gender, address, phone, type, role, bio, imageURL, status);
        var tutor = new TutorModel({
            _id: user._id,
            title: title,
            price: price,
            subjects: subjects,
            feedback: feedback
        });
        tutor.save().catch(error => console.log(error));
        return tutor;
    }
}