const dbConnection = require('./database.js')

exports.get_assets_by_size = async (req, res) => {
    console.log('call to /bySize...')

    const { fromSize, toSize } = req.body

    console.log('ranges')
    console.log(fromSize)
    console.log(toSize)

    try {
        var sql = `select assets.assetid, assets.userid, assets.assetname, assets.bucketkey,
                metadata.filesize, metadata.reswidth, metadata.resheight,
                metadata.locationlat, metadata.locationlong from assets, metadata
                where metadata.assetid = assets.assetid
                and metadata.filesize BETWEEN ? AND ? ORDER BY metadata.filesize`;

        const values = [fromSize, toSize]
        dbConnection.query(sql, values, function (err, result) {
            if (err) throw err
            console.log('res-> ', result)
            res.status(200).json({
                message: 'success',
                data: result,
            })
        })
    } catch (err) {
        // try
        res.status(400).json({
            message: err.message,
            data: [],
        })
    } // catch
} // get_assets
