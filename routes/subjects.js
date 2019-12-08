const express = require("express");
const router = express.Router();
const TagModel = require('../models/tag');
const SubjectModel = require('../models/subject');
const TagSubjectModel = require('../models/tag-subject');
const modelGenerator = require("../utils/model-generator");

router.post("/insert", async (req, res) => {
    let { name, category, description }  = req.body;
    var _subject = await SubjectModel.findOne({name: name});
    if (!_subject) {
        var subject = modelGenerator.createSubject(name, category, description);
        res.json(subject);
    } else {
        res.json(null);
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
    else {
        res.json(null);
    }
})

router.delete("/delete", async (req, res) => {
    let result = await SubjectModel.deleteOne({_id: req.body._id});
    let resultTS = await TagSubjectModel.deleteMany({_idSubject: req.body._id});
    result.deletedCount === 0 && resultTS.deletedCount === 0 ? res.json(false) : res.json(true);
})

router.post("/insert/tag", async (req, res) => {
    var { _idTag , _idSubject } = req.body;
    const tag = await TagModel.findById({_id: _idTag});
    const subject = await SubjectModel.findById({_id: _idSubject});
    const ts = await TagSubjectModel.findOne({_idTag: _idTag, _idSubject: _idSubject});

    if (tag && subject && !ts) {
        var tagSubject = modelGenerator.createTagSubject(_idTag, _idSubject);
        if (tagSubject) {
            res.json(tagSubject);
        }
    }
    res.json(null);
});

router.delete("/delete/tag", async (req, res) => {
    var { _idTag , _idSubject } = req.body;
    var result = await TagSubjectModel.deleteOne({_idTag, _idSubject});
    result.deletedCount === 0 ? res.json(false) : res.json(true);
});

module.exports = router;