const express = require("express");
const router = express.Router();
const MessageModel = require('../models/message');
const SubjectModel = require('../models/subject');
const UserModel = require('../models/user');
const modelGenerator = require("../utils/model-generator");

router.get("/api", async (req, res) => {
    let list = await MessageModel.find();
    res.json(list);
});

router.post("/insert", async (req, res) => {
    let { _idSender, _idRecipient, contents }  = req.body;
    var message = modelGenerator.createMessage(_idSender, _idRecipient, contents);
    res.json(message);
})

router.post("/update", async (req, res) => {
    let message = await MessageModel.findById({_id: req.body._id})
    if (message) {
        for (var key in req.body) {
            message[key] = req.body[key];
        }
        message.save().then(result => res.json(result)).catch(err => console.log(err));
    }
    else {
        res.json(null);
    }
})

router.delete("/delete", async (req, res) => {
    let result = await MessageModel.deleteOne({_id: req.body._id});
    result.deletedCount === 0 ? res.json(false) : res.json(true);
})

module.exports = router;