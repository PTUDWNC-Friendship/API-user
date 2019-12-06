const express = require("express");
const router = express.Router();
const TagModel = require('../models/tag');
const SubjectModel = require('../models/subject');
const TagSubjectModel = require('../models/tag-subject');
const modelGenerator = require("../utils/model-generator");

router.post("/insert", (req, res) => {
    let { name, category, description }  = req.body;
    var subject = modelGenerator.createSubject(name, category, description);
    if (subject) {
        let _subject = modelGenerator.toSubjectObject(subject);
        res.json(_subject);
    }
})

router.post("/update", async (req, res) => {
    let subject = await SubjectModel.findById({_id: req.body._id})
    if (subject) {
        for (var key in req.body) {
            subject[key] = req.body[key];
        }
        subject.save().then(result => res.json(result)).catch(err => console.log(err));
    }
})

router.post("/insert/tag", async (req, res) => {
    var { _idTag , _idSubject } = req.body;
    const tag = await TagModel.findById({_id: _idTag});
    const subject = await SubjectModel.findById({_id: _idSubject});

    if (tag && subject) {
        var tagSubject = modelGenerator.createTagSubject(_idTag, _idSubject);
        if (tagSubject) {
            res.json(tagSubject);
        }
    }
    res.json({message: "Error occured!"});
});

router.post("/delete/tag", async (req, res) => {
    var { _idTag , _idSubject } = req.body;
    TagSubjectModel.findOne({_idTag, _idSubject}).remove().exec(result => {
        res.json({message: "Delete successfully"});
    });
    res.json({message: "Delete tag-subject unsuccessfully"});
});

module.exports = router;