const process = require('process');
const { MongoClient } = require("mongodb");

class DBClient {
    constructor() {
        this.username = process.env.DB_HOST;
        if (!this.name) this.name = 'localhost';
        this.db_port = process.env.DB_PORT;
        if (!this.db_port) this.db_port = '27017';
        this.db = process.env.DB_DATABASE;
        const uri = `mongodb+srv://${this.username}@${this.DB_DATABASE}:${this.db_port}`;
        this.client = new MongoClient(uri);
        this.alive = this.isAlive();
    }
    
    isAlive() {this.client.connect((err, client)=>{
        if (err) { return false;}
        return true;
    })};

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
    