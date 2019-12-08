const express = require("express");
const router = express.Router();
const TagModel = require('../models/tag');
const SubjectModel = require('../models/subject');
const TagSubjectModel = require('../models/tag-subject');
const modelGenerator = require("../utils/model-generator");

router.get("/api", async (req, res) => {
    let list = await TagModel.find();
    res.json(list);
});

router.get("/api/:id", async (req, res) => {
    let { id } = req.params;
    let result = await TagModel.findOne({_id: id});
    res.json(result);
});

router.post("/insert", async (req, res) => {
    let { name }  = req.body;
    var _tag = await TagModel.findOne({name: name});
    if (!_tag) {
        var tag = modelGenerator.createTag(name);
        res.json(tag);
    } else {
        res.json(null);
    }
})

router.post("/update", async (req, res) => {
    let tag = await TagModel.findById({_id: req.body._id})
    if (tag) {
        for (var key in req.body) {
            tag[key] = req.body[key];
        }
        tag.save().then(result => res.json(result)).catch(err => console.log(err));
    } 
    else {
        res.json(null);
    }
})

router.delete("/delete", async (req, res) => {
    let result = await TagModel.deleteOne({_id: req.body._id});
    let resultTS = await TagSubjectModel.deleteMany({_idSubject: req.body._id});
    result.deletedCount === 0 && resultTS.deletedCount === 0 ? res.json(false) : res.json(true);
})

router.post("/insert/subject", async (req, res) => {
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

router.delete("/delete/subject", async (req, res) => {
    var { _idTag , _idSubject } = req.body;
    var result = await TagSubjectModel.deleteOne({_idTag, _idSubject});
    result.deletedCount === 0 ? res.json(false) : res.json(true);
});

module.exports = router;