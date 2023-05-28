const dbConnection = require('./database.js')
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name } = require('./aws.js');

async function getAssetInfo(assetid) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT userid, assetname, bucketkey FROM assets WHERE assetid = ?';
   dbConnection.query(sql, [assetid], (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        if (results.length > 0) {
          resolve({
            user_id: results[0].userid,
            asset_name: results[0].assetname,
            bucket_key: results[0].bucketkey
          });
        } 
          else {
              resolve(null);
          }
      }
    });
  });
}

exports.get_download = async (req, res) => {
  console.log('call to /download...');
  try {

    const assetid = req.params.assetid;
    console.log(`assetid: ${assetid}`);
    const result = await getAssetInfo(assetid);
      console.log(result);
      if (result == null) {
          console.log("No such asset");
          res.status(200).json({"message":"no such asset...","user_id":-1,"asset_name":"?","bucket_key":"?","data":[]});
      }
      else {
           const { user_id, asset_name, bucket_key } = result;
          console.log(`user_id: ${user_id}, asset_name: ${asset_name}, bucket_key: ${bucket_key}`);
    const s3Result = await s3.send(new GetObjectCommand({
      Bucket: s3_bucket_name,
      Key: bucket_key
    }));
    const datastr = await s3Result.Body.transformToString('base64');
    console.log(`Downloaded from S3 and saved as '${asset_name}'`);
    res.status(200).json({ 
        "message": "success",
        "user_id": user_id,
        "asset_name": asset_name,
        "bucket_key": bucket_key,
        data: datastr });
      }
    
  } catch (err) {
    console.log(`download() failed: ${err}`);
    res.status(500).json({
      message: 'Internal server error',
      user_id: -1,
      asset_name: '?',
      bucket_key: '?',
      data: []
    });
  }
}
