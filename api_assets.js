const dbConnection = require('./database.js');

exports.get_assets = async (req, res) => {

  console.log("call to /assets...");
 try {
     var sql = `select assets.assetid, assets.userid, assets.assetname, assets.bucketkey,
         metadata.filesize, metadata.reswidth, metadata.resheight,
         metadata.locationlat, metadata.locationlong, metadata.datecreated
         from assets, metadata
         where metadata.assetid = assets.assetid`;
    dbConnection.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      res.status(200).json({
        "message": "success",
        "data": result
      });
    });
    

    //
    // TODO: remember we did an example similar to this in class with
    // movielens database (lecture 05 on Thursday 04-13)
    //
    // MySQL in JS:
    //   https://expressjs.com/en/guide/database-integration.html#mysql
    //   https://github.com/mysqljs/mysql
    //

  } // try
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  } // catch

}; // get_assets
