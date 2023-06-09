//
// app.put('/user', async (req, res) => {...});
//
// Inserts a new user into the database, or if the
// user already exists (based on email) then the
// user's data is updated (name and bucket folder).
// Returns the user's userid in the database.
//
const dbConnection = require('./database.js')
const express = require('express')
const app = express()
var crypto = require('crypto');

app.use(express.json({ strict: false }))

const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = 'select userid from users where email = ?'
    dbConnection.query(sql, [email], (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results[0] || null)
      }
    })
  })
}

const insertUser = (email, lastname, firstname, bucketfolder) => {
  return new Promise((resolve, reject) => {
    const sql =
      'INSERT INTO users (email, lastname, firstname, bucketfolder) VALUES (?, ?, ?, ?)'
    dbConnection.query(
      sql,
      [email, lastname, firstname, bucketfolder],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          const newUser = {
            userid: results.insertId,
            email: email,
            lastname: lastname,
            firstname: firstname,
            bucketfolder: bucketfolder,
          }
          resolve(newUser)
        }
      },
    )
  })
}
const updateUser = (userid, lastname, firstname, bucketfolder) => {
  return new Promise((resolve, reject) => {
    const sql =
      'UPDATE users SET lastname = ?, firstname = ?, bucketfolder = ? WHERE userid = ?'
    dbConnection.query(
      sql,
      [lastname, firstname, bucketfolder, userid],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
    )
  })
}

exports.put_user = async (req, res) => {
  console.log('call to /user...hahaha')

  try {
    var data = req.body // data => JS object

    console.log(data)
    const { email, lastname, firstname } = req.body
    const user = await getUserByEmail(email)
    const bucketfolder = crypto.randomUUID();

    if (user !== null) {
      await updateUser(user.userid, lastname, firstname, bucketfolder)
      res.status(200).json({
        message: 'updated',
        userid: user.userid,
      })
    } else {
      const newUser = await insertUser(email, lastname, firstname, bucketfolder)
      res.status(200).json({
        message: 'inserted',
        userid: newUser.userid,
      })
    }
  } catch (err) {
    //try
    res.status(400).json({
      message: err.message,
      userid: -1,
    })
  } //catch
} //put
