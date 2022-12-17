import { getMaxListeners } from "process";
import { dbClient } from "../utils/db";
const crypto = require('crypto');

dbclient = dbClient();

class UserController{
    static postNew(req, res){
        const {email, password} = req.body;
        if(!email) res.status(400).json({error: 'Missing email'});
        if(!password) res.status(400).json({error: 'Missing password'});
        usr = dbClient.db.collection('users').find(email).toArray((err, docs)=>{
            if (err) { console.log(err); }
            res.status(400).json({"error": "Already exist"});

            hashed_password = crypto.createHash('sha1').update(password).digest(hex);

            user = {'email': email, 'password': hashed_password};
    
            id = dbClient.db.collection('users').insertOne(user);
            
            res.status(201).json({"_id" : id,  "email": email, "password": hashed_password});
            })}
        
    static getMe(req, res){
        if(req.headers['X-Token']){ token = req.headers['X-Token'];}

            dbClient.db.collection('users').find(token).toArray((err, doc)=>{
                if(doc){
                    
                }
            });

        };
    }

       

export {UserController as UserController};
