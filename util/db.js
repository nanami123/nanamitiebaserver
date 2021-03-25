const mysql = require('mysql')

let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'tieba'
})

connection.connect()

function query(sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

module.exports = query