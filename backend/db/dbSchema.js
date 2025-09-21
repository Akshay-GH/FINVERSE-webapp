import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl);

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
   
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

const bankSchema= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance:{ type: Number, default: 0}  // always store lowest currency unit (like paise, cents)
})


const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', bankSchema);

export {
    User,
    Account
};
