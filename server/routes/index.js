const connection = require('../db')

module.exports = (req, res, next) => {
  if (req.body.params.query) {
    connection.query(req.body.params.query, (err, results) => {
      if (err) {
        res.status(404)
        res.json({ errorMeesages: `ERROR: ${err.sqlMessage}` })
      } else {
        console.log('Data recieved from DB!\n')
        res.json(results)
      }
    })
  }
}
