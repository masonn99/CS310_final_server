const dbConnection = require('./database.js')
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name } = require('./aws.js');

exports.geocode_images = async (req, res) => {
    console.log('call to /geocode...');
    try {
        const latNE  = req.params.latNE;
        const longNE = req.params.longNE;
        const latSW  = req.params.latSW;
        const longSW = req.params.longSW;
    } catch (err) {
        console.log(`geocode() failed: ${err}`);
        res.status(500).json({
            message: 'Internal server error',
            user_id: -1,
            asset_name: '?',
            bucket_key: '?',
            data: []
        });
    }
}
