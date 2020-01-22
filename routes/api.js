var express = require('express');
var router = express.Router();
const fs = require('fs');

/* GET users listing. */
router.get('/page/:name', function(req, res) {
  if(fs.existsSync(`${__dirname}/../datas/${req.param('name')}.json`)) {
    res.json(JSON.parse(fs.readFileSync(`${__dirname}/../datas/${req.param('name')}.json`).toString()));
  } else {
    fs.writeFileSync(`${__dirname}/../datas/${req.param('name')}.json`, JSON.stringify({}));
    res.json({});
  }
});

router.put('/page/:name', function (req, res) {
  fs.writeFileSync(`${__dirname}/../datas/${req.param('name')}.json`, req.body.page);
  res.json({
    message: 'respond with a resource'
  });
});

module.exports = router;
