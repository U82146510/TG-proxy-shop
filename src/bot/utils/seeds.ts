import {User} from '../../models/adminPanel.ts'; 

export async function seedAdmin():Promise<void>{
    try {
        const user = await User.findOne({username:'admin'});
        if(!user){
            await User.create({username:'admin',password:"aA123456789!@#"})
            return;
        }
    } catch (error) {
        console.error(error);
    }
}