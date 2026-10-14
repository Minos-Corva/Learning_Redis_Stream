import { createClient } from "redis";
import { RTConsumer } from "./repository/RTConsumer.js";

//Create Client
const client = createClient();
await client.connect();

const cookieId = "c1";

//create consumer
console.log("Consumer Created");
const con = new RTConsumer(client,cookieId,"con:"+cookieId);

//consume
let check = true;
while(true){
    try{
        const pending = await con.getPending();
        //console.log(pending);
        if(pending[0].messages){
            await con.consume(pending);
        }

        const result = await con.readUnConsumed();
        //console.log(result);
        await con.consume(result);
    }catch(err){
        if(check){
            console.log("Group Not Created Yet");
            console.error(err);
            check = false;
        }    
    }
}