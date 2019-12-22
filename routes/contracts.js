const express = require("express");
const router = express.Router();
const ContractModel = require('../models/contract');
const SubjectModel = require('../models/subject');
const FeedbackModel = require('../models/feedback');
const UserModel = require('../models/user');
const modelGenerator = require("../utils/model-generator");

router.get("/api", async (req, res) => {
    let list = await ContractModel.find();
    for (var i = 0; i < list.length; i++ ) {
        list[i] = list[i]._doc;
        const { _idStudent, _idTutor, _idSubject, _idFeedback } = list[i];

        if (_idStudent) {
            const resStudent = await UserModel.findOne({_id: _idStudent});
            const student = await modelGenerator.toStudentObject(resStudent);
            list[i] = { ...list[i], student};
        }

        if (_idTutor) {
            const resTutor = await UserModel.findOne({_id: _idTutor});
            const tutor = await modelGenerator.toTutorObject(resTutor);
            list[i] = { ...list[i], tutor };
        }

        if (_idSubject) {
            const resSubject = await SubjectModel.findOne({_id: _idSubject});
            const subject = await modelGenerator.toSubjectObject(resSubject);
            console.log(subject);
            list[i] = { ...list[i], subject};
        }
        if (_idFeedback) {
          const resFeedback = await FeedbackModel.findOne({_id: _idFeedback});
          const feedback = await modelGenerator.toFeedbackObject(resFeedback);
          list[i] = { ...list[i], feedback};
        } 
    }
    res.json(list);
});

router.get("/api/:id", async (req, res) => {
    let { id } = req.params;
    let result = await ContractModel.findOne({_id: id});
    res.json(result);
});

router.get("/tutor/:idStudent", async (req, res) => {
    let { idStudent } = req.params;
    let list = await ContractModel.find({_idStudent: idStudent});

    let listResult =[];
    for(var item of list) {
      const tutor = await UserModel.findOne({_id: item._idTutor});
      let feedback = null;
      if(item._idFeedback!==null) {
         feedback = await FeedbackModel.findOne({_id: item._idFeedback});

      }
      if(feedback!==null) {
        const resultItem = {
            ...item._doc,
            tutor: {...tutor._doc},
            feedback: {...feedback._doc}
          }

      listResult.push(resultItem);
      } else {
        const resultItem = {
            ...item._doc,
            tutor: {...tutor._doc}
      }
      listResult.push(resultItem);
    }
}
    res.json(listResult);
});

router.get("/student/:idTutor", async (req, res) => {
    let { idTutor } = req.params;
    let list = await ContractModel.find({_idTutor: idTutor});
    let listResult =[];
    for(var item of list) {
      const student = await UserModel.findOne({_id: item._idStudent});
      const tutor = await UserModel.findOne({_id: item._idTutor});
      const resultItem = {
        ...item._doc,
        student: {...student._doc},
        tutor: {...tutor._doc}
      }

      listResult.push(resultItem);
    }
    res.json(listResult);
});

router.post("/insert", async (req, res) => {
    let { _idStudent, _idTutor, _idSubject, _idFeedback, startDate, endDate, createdDate, policy, hoursNumber, totalPrice, revenue, message, status }  = req.body;
    var contract = modelGenerator.createContract(_idStudent, _idTutor, _idSubject, _idFeedback, startDate, endDate, createdDate, policy, hoursNumber, totalPrice, revenue, message, status);
    res.json(contract);
})

router.post("/update", async (req, res) => {
    let contract = await ContractModel.findById({_id: req.body._id})
    if (contract) {
        for (var key in req.body) {
            contract[key] = req.body[key];
        }
        contract.save().then(result => res.json(result)).catch(err => console.log(err));
    }
    else {
        res.json(null);
    }
})

router.delete("/delete", async (req, res) => {
    let result = await ContractModel.deleteOne({_id: req.body._id});
    result.deletedCount === 0 ? res.json(false) : res.json(true);
})


module.exports = router;
