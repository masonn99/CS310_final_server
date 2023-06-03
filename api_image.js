const dbConnection = require("./database.js");
const {PutObjectCommand} = require("@aws-sdk/client-s3");
const {s3, s3_bucket_name, s3_region_name} = require("./aws.js");
const uuid = require("uuid");

exports.post_image = async (req, res) => {
  console.log("call to /image...");
  
  const {assetname, data, datecreated, filesize, reswidth, resheight, locationlat, locationlong} = req.body; //metadata is going to be a dictionary of metadatas inside the main json dictionary 
//date format is "1999-10-10 05:40:30"
  try {
    dbConnection.query(
      "SELECT bucketfolder FROM users WHERE userid = ?",
      [req.params.userid],
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            message: "Internal server error",
            assetid: -1,
          });
        }

        if (!result || result.length === 0) {
          return res.status(200).json({
            message: "No such user...",
            assetid: -1,
          });
        }
        
        const userId = req.params.userid;
        const bucketFolder = result[0].bucketfolder;
        const assetKey = uuid.v4();
        const s3Key = `${bucketFolder}/${assetKey}.jpg`;
        const imageBuffer = Buffer.from(data, "base64");
        const putObjectParams = {
          Bucket: s3_bucket_name,
          Key: s3Key,
          Body: imageBuffer,
        };
        
        try {
          await s3.send(new PutObjectCommand(putObjectParams));

          const sql =
            "INSERT INTO assets (assetid, userid, assetname, bucketkey, datecreated, filesize, reswidth, resheight, locationlat, locationlong) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
          const values = [null, userId, assetname, s3Key, datecreated, filesize, reswidth, resheight, locationlat, locationlong];

          dbConnection.query(sql, values, (insertError, insertResult) => {
            if (insertError) {
              console.error(insertError);
              return res.status(500).json({
                message: "Error updating assets database",
                assetid: -1,
              });
            }

            const assetId = insertResult.insertId;

            res.status(200).json({
              message: "Success",
              assetid: assetId,
            });
          });
        } catch (uploadError) {
          console.error(uploadError);
          res.status(500).json({
            message: "Error uploading image to S3",
            assetid: -1,
          });
        }
      }
    );
  } catch (err) {
    res.status(400).json({
      message: err.message,
      assetid: -1,
    });
  }
};
