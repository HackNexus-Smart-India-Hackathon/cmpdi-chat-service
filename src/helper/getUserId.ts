import User from "../models/user";

export const NOTFOUND = "User Not found"

export async function getUserId(email:string) {
    try{
        let user = await User.findOne({email})
        if(user)
            return user._id;
        else 
            return NOTFOUND
    }
    catch(error){
        console.log(error)
    }
    return null;
}