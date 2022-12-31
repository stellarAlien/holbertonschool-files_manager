import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
const fs = require('fs');
import process from 'process';
import { diffieHellman } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
const mime = require('mime-types');

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
        const parentObjectid = new ObjectId(parentId);
        const parent_file = files.findOne({_id: parentObjectid }, (err, file)=>{
            if(!file) { res.status(400).json({error: "Parent not found"}); }
            if(file.type != folder) { res.status(400).json({error: "Parent is not a folder"}); }
        });
                            };
        
        const userId = session;
        folder_insert = {
            userId: ObjectId(userId),
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
            userId: ObjectId(userId),
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
    
    static async getShow(req, res) {
        const token = req.headers('X-Token');
        if (token) { session = await redisClient.get(`auth_${token}`); }
        if (!session || session === '') { return res.status(401).error({error: 'Unauthorized'}); }
        id = req.params.id;
        const file = dbClient.db.collection('files').find({_id: ObjectId(id)}).toArray( (err, file) =>{
            if(err || ! file) { return res.status(404).json({error: "Not found"}); }
            return res.json(file[0]);
        });
    }

    static async getIndex(req, res) {
        const token = req.headers('X-Token');
        if (token) { session = await redisClient.get(`auth_${token}`); }
        if (!session || session === '') { return res.status(401).error({error: 'Unauthorized'}); }
        parentId = req.params.parentId || 0;
        page = req.params.page;
        user = await dbClient.db.collection('users').findOne( {_id: ObjectId(session)} );
        const filter_query = [ { '$match': { parentId, userId: user._id}},
                                { '$project': {'id': '$_id', '$serId': '$userId', 'name': 1, 'type': 1, 'parentId': 1} },
                                { '$limit': 20},
                                { '$skip': page * 20},
                            ]
        const files = dbClient.db.collection('files').aggregate(filter_query).toArray();
        res.status(200).json(files)
    }
    
    static async putPublish(req, res) {
        const token = req.headers('X-Token');
        if (token) { session = await redisClient.get(`auth_${token}`); }
        if (!session || session === '') { return res.status(401).error({error: 'Unauthorized'}); }
        file_id = req.params.id;
        if(!files_id || files_id == '') {  return res.status(401).error({error: 'Unauthorized'}); }
        
        const update_query = { '$set': { 'isPublic': 'true'} } 
        const updated_file = await dbClient.db.collection('files').updateOne({_id: ObjectId(file_id)}, update_query)
        if (!updated_file) { res.status(404).json({'error': 'Not found'}); }
        res.status(200).json(updated_file);
        }

        static async putUnpublish(req, res) {
            const token = req.headers('X-Token');
            if (token) { session = await redisClient.get(`auth_${token}`); }
            if (!session || session === '') { return res.status(401).error({error: 'Unauthorized'}); }
            file_id = req.params.id;
            if(!files_id || files_id == '') {  return res.status(401).error({error: 'Unauthorized'}); }
            
            const update_query = { '$set': { 'isPublic': 'false'} } 
            const updated_file = await dbClient.db.collection('files').updateOne({_id: ObjectId(file_id)}, update_query)
            if (!updated_file) { res.status(404).json({'error': 'Not found'}); }
            res.status(200).json(updated_file);
            }
        
        static async getFile(req, res) {
            const token = req.headers('X-Token');
            if (token) { session = await redisClient.get(`auth_${token}`); }
            if (!session || session === '') { return res.status(401).error({error: 'Unauthorized'}); }
            const file_id = req.params.id;

            const file = dbClient.db.collection('files').findOne({_id: ObjectId(file_id), userId: ObjectId(session)}, (err, file) => {
            if (err) { console.log(err) ; }
            if(!file) { return res.json(404).json({'error': 'Not found'})}
            if (file.type !== 'folder' && file.isPublic === 'true') { return res.statsu(200).json(file); }
            }).toArray();
            if(!fs.existsSync(file[0].localPath) || (file[0].isPublic === 'false')) {
                return res.statsu(404).json({'error': 'Not found'});
            }
            if (file[0].type == 'folder') { return res.status(400).json( {'error': `A folder doesn't have content`}) }
            const type = mime(file[0].name);
            const charset = type.split('.')[1];
            try {
                const data = fs.readFileSync(file[0].localPath, charset);
                return res.status(200).send(data);
            } catch(e) {
                return (res.status.json({'error': 'could not read file'}));
            }
        }
        }
       


   
        
module.exports = FilesController;