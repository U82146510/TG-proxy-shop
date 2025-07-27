import {Document,model,Schema} from "mongoose";
import bcrypt from "bcryptjs";

interface IAuth extends Document{
    username:string;
    password:string;
    comparePassword(candidatePassword:string):Promise<boolean>
};

const authSchema = new Schema<IAuth>({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minlength:3,
        maxlength:30,
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    password:{
        type:String,
        minlength:12,
        select:false,
        validate: {
            validator: function(v: string) {
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{12,}$/.test(v);
            },
            message: 'Password must contain uppercase, lowercase, number, and special character'
        }
    }
});

authSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    try {
        const genSalt = await bcrypt.genSalt(20);
        const hashPassword = await bcrypt.hash(this.password,genSalt);
        this.password = hashPassword;
        next();
    } catch (error) {
        next(error as Error)
    }
});

authSchema.methods.comparePassword = async function (candidatePassword:string):Promise<boolean>{
    try {
        if(!this.password) return false;
        return bcrypt.compare(candidatePassword,this.password as string)
    } catch (error) {
        bcrypt.compare(candidatePassword,this.password)
        return false;
    }
}

export const Auth = model<IAuth>('Auth',authSchema);