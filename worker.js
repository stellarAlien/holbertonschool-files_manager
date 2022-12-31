import { ObjectId } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
const fs = require('fs');

const q = Queue('fileQueue');

q.process(async (job, done)=>{
    if(!job.data.fileId) { throw new Error('file id missing'); }
    if(!job.data.userId) { throw new Error('Missing user Id');}

    const file = await dbClient.db.collection('files').findOne({_id: job.data.fileId, userId: job.data.userId}, (err, file) =>{
        if(err) {console.log(err); }
        if(!file) { throw new Error('File not Found'); }
    });

    try {
        const sizes = [500, 250, 100];
        for (const width in sizes) {
            const options = {width: width, responseType: 'base64'}
            thumbnail = await iamgeThumbnail(file.localPath, options);
            fs.writeFileSync(`${fs.localPath}_${width}`, thumbnail, 'base64');
        }
    } catch(e) {
        console.log(err);
    }
    done();
});
