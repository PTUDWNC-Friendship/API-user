const express = require("express");
const router = express.Router();
const FeedbackModel = require('../models/feedback');
const UserModel = require('../models/user');
const modelGenerator = require("../utils/model-generator");

router.get("/api", async (req, res) => {
    let list = await FeedbackModel.find();
    for (var i = 0; i < list.length; i++ ) {
        list[i] = list[i]._doc
        const {_idStudent} = list[i];
        
        if (_idStudent) {
            const resStudent = await UserModel.findOne({_id: _idStudent});
            const student = await modelGenerator.toStudentObject(resStudent);
            list[i] = { ...list[i], student};
        }
    }
    res.json(list);
});

router.get("/api/:id", async (req, res) => {
    let { id } = req.params;
    let result = await FeedbackModel.findOne({_id: id});
    res.json(result);
});

router.get("/:idStudent", async (req, res) => {
    let { idStudent } = req.params;
    let list = await FeedbackModel.find({_idStudent: idStudent});
    res.json(list);
});

router.post("/insert", async (req, res) => {
    let { _idStudent, rate, comment }  = req.body;
    var feedback = modelGenerator.createFeedback(_idStudent, rate, comment);
    res.json(feedback);
})

router.post("/update", async (req, res) => {
    let feedback = await FeedbackModel.findById({_id: req.body._id})
    if (feedback) {
        for (var key in req.body) {
            feedback[key] = req.body[key];
        }
        feedback.save().then(result => res.json(result)).catch(err => console.log(err));
    }
    else {
        res.json(null);
    }
})

router.delete("/delete", async (req, res) => {
    let result = await FeedbackModel.deleteOne({_id: req.body._id});
    result.deletedCount === 0 ? res.json(false) : res.json(true);
})

module.exports = router;