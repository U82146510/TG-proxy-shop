import {Auth} from '../../models/adminPanel';

export async function creteAdmin():Promise<void>{
    try {
        const user = await Auth.findOne({username:'admin'});
        if(!user){
            await Auth.create({username:'admin',password:'aA123456789!@#'})
            return;
        }
    } catch (error) {
        console.error(error);
    }
}