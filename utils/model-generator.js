const UserModel = require("../models/user");
const StudentModel = require("../models/student");
const TutorModel = require("../models/tutor");
const SubjectModel = require("../models/subject");
const TagModel = require("../models/tag");
const TagSubjectModel = require("../models/tag-subject");
const FeedbackModel = require("../models/feedback");
const ContractModel = require("../models/contract");
const MessageModel = require("../models/message");
const mongoose = require("mongoose");

module.exports = {
  createUser: (
    username,
    password,
    firstName,
    lastName,
    gender,
    address,
    phone,
    type,
    role,
    bio,
    imageURL,
    status
  ) => {
    var user = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      username: username,
      password: password,
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      address: address,
      phone: phone,
      type: type,
      role: role,
      bio: bio,
      imageURL: imageURL,
      status: status
    });
    user
      .save()
      .then(result => {
        return result;
      })
      .catch(error => {
        console.log(error);
      });
    return user._doc;
  },
  createStudent: (_id, hiredTutors) => {
    var student = new StudentModel({
      _id: _id,
      hiredTutors: hiredTutors
    });
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
    });
    subject
      .save()
      .then(result => {
        return result;
      })
      .catch(error => {
        console.log(error);
      });
    return subject._doc;
  },
  createTagSubject: (_idTag, _idSubject) => {
    var tagSubject = new TagSubjectModel({
      _id: new mongoose.Types.ObjectId(),
      _idTag: _idTag,
      _idSubject: _idSubject
    });
    tagSubject
      .save()
      .then(result => {
        return result;
      })
      .catch(error => {
        console.log(error);
      });
    return tagSubject._doc;
  },
  createTag: name => {
    var tag = new TagModel({
      _id: new mongoose.Types.ObjectId(),
      name: name
    });
    tag
      .save()
      .then(result => {
        return result;
      })
      .catch(error => {
        console.log(error);
      });
    return tag._doc;
  },
  createFeedback: (_idStudent, rate, comment) => {
    var feedback = new FeedbackModel({
      _id: new mongoose.Types.ObjectId(),
      _idSubject: _idStudent,
      rate: rate,
      comment: comment
    });
    feedback
      .save()
      .then(result => {
        return result;
      })
      .catch(error => {
        console.log(error);
      });
    return feedback._doc;
  },
  createContract: (
    _idStudent,
    _idTutor,
    _idSubject,
    _idFeedback,
    startDate,
    endDate,
    createdDate,
    policy,
    hoursNumber,
    totalPrice,
    revenue,
    message,
    status
  ) => {
    var contract = new ContractModel({
      _id: new mongoose.Types.ObjectId(),
      _idStudent: _idStudent,
      _idSubject: _idSubject,
      _idTutor: _idTutor,
      _idFeedback: _idFeedback,
      startDate: startDate,
      endDate: endDate,
      createdDate: createdDate,
      policy: policy,
      hoursNumber: hoursNumber,
      totalPrice: totalPrice,
      revenue: revenue,
      message: message,
      status: status
    });
    contract
      .save()
      .then(result => {
        return result;
      })
      .catch(error => {
        console.log(error);
      });
    return contract._doc;
  },
  createMessage: (_idSender, _idRecipient, contents) => {
    var message = new MessageModel({
      _id: new mongoose.Types.ObjectId(),
      _idSender: _idSender,
      _idRecipient: _idRecipient,
      contents: contents
    });
    message
      .save()
      .then(result => {
        return result;
      })
      .catch(error => {
        console.log(error);
      });
    return message._doc;
  },
  toUserObject: user => {
    return {
      _id: user._id,
      username: user.username,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      address: user.address,
      phone: user.phone,
      type: user.type,
      role: user.role,
      bio: user.bio,
      imageURL: user.imageURL,
      status: user.status
    };
  },
  toStudentObject: async student => {
    let _student = await StudentModel.findOne({ _id: student._id });
    var object = {
      _id: student._id,
      username: student.username,
      password: student.password,
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      address: student.address,
      phone: student.phone,
      type: student.type,
      role: student.role,
      bio: student.bio,
      imageURL: student.imageURL,
      status: student.status,
      // hiredTutors: _student.hiredTutors
    };
    return object;
  },
  toTutorObject: async _tutor => {
    let tutor = await TutorModel.findOne({ _id: _tutor._id });
    var object = {
      _id: _tutor._id,
      username: _tutor.username,
      password: _tutor.password,
      firstName: _tutor.firstName,
      lastName: _tutor.lastName,
      gender: _tutor.gender,
      address: _tutor.address,
      phone: _tutor.phone,
      type: _tutor.type,
      role: _tutor.role,
      bio: _tutor.bio,
      imageURL: _tutor.imageURL,
      status: _tutor.status,
      title: tutor.title,
      price: tutor.price,
      subjects: tutor.subjects,
      feedback: tutor.feedback
    };
    return object;
  },
  toSubjectObject: _subject => {
    SubjectModel.findById({ _id: _subject._id }).then(subject => {
      var object = {
        _id: subject._id,
        name: subject.name,
        category: subject.category,
        description: subject.description,
        tags: subject.tags
      };
      return object;
    });
  },
  toTagObject: _tag => {
    TagModel.findById({ _id: _tag._id }).then(tag => {
      var object = {
        _id: tag._id,
        name: tag.name
      };
      return object;
    });
  }
};
