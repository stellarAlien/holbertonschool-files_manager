import { dbClient } from "../utils/db";

dbclient = dbClient();

class UserController{
    static postNew(req, res){
        const {email, password} = req.body;
        if(!email) res.status(400).json({error: 'Missing email'});
        if(!password) res.status(400).json({error: 'Missing password'});
        if(dbClient.db.collection('users').find(email))
    }
}