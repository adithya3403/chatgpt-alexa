const express = require('express');
const { getData,
    getDataById,
    saveData,
    updateData,
    deleteData
} = require('./controller.js');

const router = express.Router();
router.get('/', (req, res) => { res.redirect('/data'); });
router.get('/data', getData);
router.get('/data/:id', getDataById);
router.post('/data', saveData);
router.put('/data/:id', updateData);
router.delete('/data/:id', deleteData);

// modules.export = router;
module.exports = router;