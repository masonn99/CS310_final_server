use photoapp;

select assets.assetid, assets.userid, assets.assetname, assets.bucketkey,
         metadata.filesize, metadata.reswidth, metadata.resheight,
         metadata.locationlat, metadata.locationlong, metadata.datecreated
         from assets, metadata
         where metadata.assetid = assets.assetid
         and locationlat <= 50
         and locationlat >= 47
         and locationlong <= -120
         and locationlong >= -125;

         /*
select * from metadata, assets
where metadata.assetid = assets.assetid
*/
-- select * from users;
-- where locationlat > 41.9 and locationlong < 0;
-- select * from users;

