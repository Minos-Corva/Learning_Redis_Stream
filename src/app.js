import express, { urlencoded } from 'express'
import { Stream } from './repository/RedisClient.js';

const app = express();
const port = 3000;

const client = new Stream();
await client.connect();

app.use(express.json()); 

app.post('/:cookieId',async (req,res)=>{ //fire and forget
    const cookieId = req.params.cookieId;
    client.click(cookieId);
    res.status(202).send();
});

app.get('/:cookieId',async (req,res)=>{
    const cookieId = req.params.cookieId;
    const data = await client.readall(cookieId);
    res.send(data);
});

app.listen(port,()=>{
    console.log("The server is running on http://localhost:3000/");
});