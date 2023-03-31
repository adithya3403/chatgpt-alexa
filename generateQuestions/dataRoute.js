const express = require("express");
const { getData, getDataById, saveData, updateData, deleteData } = require("./dataController.js");

const router = express.Router();

router.get('/data', getData);
router.get('/data/:id', getDataById);
router.post('/data', saveData);
router.put('/data/:id', updateData);
router.delete('/data/:id', deleteData);

module.exports = router;