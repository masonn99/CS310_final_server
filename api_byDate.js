const dbConnection = require('./database.js')

exports.get_assets_by_date = async (req, res) => {
  console.log('call to /byDate...')

  const { fromDate, toDate } = req.body

  console.log('ranges')
  console.log(fromDate)
  console.log(toDate)

  try {
    var sql =
      'SELECT * FROM assets WHERE datecreated BETWEEN ? AND ? ORDER BY datecreated'

    const values = [fromDate, toDate]
    dbConnection.query(sql, values, function (err, result) {
      if (err) throw err
      console.log('res-> ', result)
      res.status(200).json({
        message: 'success',
        data: result,
      })
    })

    //
    // TODO: remember we did an example similar to this in class with
    // movielens database (lecture 05 on Thursday 04-13)
    //
    // MySQL in JS:
    //   https://expressjs.com/en/guide/database-integration.html#mysql
    //   https://github.com/mysqljs/mysql
    //
  } catch (err) {
    // try
    res.status(400).json({
      message: err.message,
      data: [],
    })
  } // catch
} // get_assets
