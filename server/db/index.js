const mysql = require('mysql')
const keys = require('../config/keys')

const connection = mysql.createConnection(keys)

connection.connect(err => {
  if (err) throw err
  console.log('Connected!')
})

module.exports = connection
