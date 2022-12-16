const process = require('process');
const { MongoClient } = require("mongodb");

class DBClient {
    constructor() {
        this.username = process.env.DB_HOST || 'localhost';
        this.db_port = process.env.DB_PORT || '27017';
        this.db = process.env.DB_DATABASE || 'files_manager';
        const uri = `mongodb://${this.username}@${this.DB_DATABASE}:${this.db_port}`;
        this.client = new MongoClient(uri);
        this.client.connect();
        this.alive = this.isAlive();
    }
    
     isAlive (){
        if (!this.client.isConnected()) {return false;}
        return true;
    };

    async nbUsers() {
        await this.client.db(this.db).collection('users').countDocuments().then((count_documents)=>{
            return count_documents;
        });
    };
    async nbFiles(){
        await this.client.db(this.db).collection('files').countDocuments().then((count_documents)=>{
            return count_documents;
        });
    }
    
}

export {DBClient as dbClient};
    