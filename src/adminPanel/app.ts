import express,{type Application } from 'express';


const app:Application = express();
const port:number = 3000;

app.use(express.json());

export const start = async()=>{
    try{
        app.listen(port,()=>console.log('Admin Panel ON'))
    } catch (error) {
        console.error(error)
    }
}
