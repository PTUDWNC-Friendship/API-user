const express = require("express");
const router = express.Router();
const ContractModel = require('../models/contract');
const SubjectModel = require('../models/subject');
const UserModel = require('../models/user');
const modelGenerator = require("../utils/model-generator");

router.get("/api", async (req, res) => {
    let list = await ContractModel.find();
    res.json(list);
});

router.post("/insert", async (req, res) => {
    let { _idStudent, _idTutor, _idSubject, startDate, endDate, policy, totalPrice, revenue, message, status }  = req.body;
    var contract = modelGenerator.createContract(_idStudent, _idTutor, _idSubject, startDate, endDate, policy, totalPrice, revenue, message, status);
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