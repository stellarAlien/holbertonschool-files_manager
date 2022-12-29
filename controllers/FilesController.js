import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
const fs = require('fs');
import process from 'process';
import { diffieHellman } from 'crypto';
import { v4 as uuidv4 } from 'uuid';


class FilesController{

    
    storage_folder = process.env.FOLDER_PATH || '/tmp/files_manager';

    static async postUpload(req, res){
        // retrieve token
        token = req.header('X-Token') || '';
        if (!token) { res.stasus(401).json({error: 'Unathorized'});}

        const session = await redisClient.get(`auth_${token}`);
        if (!session) { res.stasus(401).json({error: 'Unathorized'}); }

        // parsing file data
        const {name} = req.body.name; 
        const  {type} = req.body.type;
        const {parentId} = req.body.parentId || 0;
        const {isPublic} = req.body.isPublic || false;
        const {data} = req.body.data;
        // handling file data
        const types = ['folder', 'file', 'image'];

        if (!name) { return res.status(400).json({error: 'Missing name'}); }

        if (!type || types.includes(type) == false) { res.json(400).json({error: 'Missing type'}); }
        if(!data && type != 'folder') { res.json(400).json({error: "Missing data"}); }
       

        if(parentId != 0) {
        const files = dbClient.db.collection.collection('files');
        const parentObjectid = new ObjectID(parentId);
        const parent_file = files.findOne({_id: parentObjectid }, (err, file)=>{
            if(!file) { res.status(400).json({error: "Parent not found"}); }
            if(file.type != folder) { res.status(400).json({error: "Parent is not a folder"}); }
        });
                            };
        
        const userId = session;
        folder_insert = {
            userId: ObjectID(userId),
            name,
            type,
            isPublic: isPublic,
            parentId: parentObjectid,
        }
        if(type == 'folder') { folder = files.inserOne(folder_insert); 
        
                            return res.status(201).json({
                                id: folder.ops[0]._id,
                                userId: folder.ops[0].userId,
                                name: folder.ops[0].name,
                                type: folder.ops[0].type,
                                isPublic: folder.ops[0].isPublic,
                                parentId: folder.ops[0].parentId
                                });    
                            }
        data = new Buffer.from(data).toString('base64'); 

        storage_path = process.env.FOLDER_PATH || '/tmp/files_manager';
        const new_file = uuidv4();
        if (!fs.existsSync(storage_path)) { 
            fs.mkdirSync(path, { recursive: true});
        }
        fs.writeFile(`${path}/${new_file}`, data, err =>{
            if (err) { return console.log(err); }
            return true;
            return 
        });
        
        const file = files.inserOne({
            name,
            type,
            userId: ObjectID(userId),
            parentId: parentObjectid,
            isPublic: isPublic,
            data: data,
            localPath: `${path}/${new_file}`,
        });

        return res.status(201).json({
            id: file.ops[0]._id,
            userId: files.ops[0].userId,
            name: file.ops[0].name,
            type: file.ops[0].type,
            isPublic: file.ops[0].isPublic,
            parentId: file.ops[0].parentId,
        });
        }
    }
        
module.exports = FilesController;