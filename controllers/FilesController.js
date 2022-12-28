import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

import process from 'process';
import { diffieHellman } from 'crypto';


class FilesController{

    types = ['folder', 'file', 'image'];
    storage_folder = process.env.FOLDER_PATH || '/tmp/files_manager';

    static postUpload(req, res){
        // retrieve token
        token = req.header('X-Token') || '';
        if (!token) { res.stasus(401).json({error: 'Unathorized'});}
        const users = dbClient.db.collection('users');
        const user = user.findOne( { token }, (err, user)=>{
            if(!user) { res.status(401).json({error: 'Unathorized'});} 
        });
        // parsing file data
        const name = req.body['name'] || '';
        const  type = req.body['type'];
        const parentId = req.body['parentId'] || 0;
        const isPublic = req.body['isPublic'] || false;
        const data = req.body['data'];
        // handling file data
        if (name == '') { res.status(400).json({error: 'Missing name'}); }
        if (!types.includes(type)) { res.json(400).json({error: 'Missing type'}); }
        if(!data && type != 'folder') { res.json(400).json({error: "Missing data"}); }
        if(data && type == 'file' || type == 'image') { data = new Buffer.from(data).toString('base64'); }

        const files = dbClient.db.collection.collection('files');
        const parentObject = new ObjectID(parent)

        };
        
    }


module.exports = FilesController;