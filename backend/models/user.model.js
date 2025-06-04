import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    lastLogin:{
        type:Date,
        default:Date.now
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    resetPasswordToken:String,
    resetPasswordExpiresAt:Date,
    verificationToken:String,
    verificationTokenExpiresAt:Date,
    profile: {
        bio: String,
        country: String,
        pictureUrl: String,
        languages: [String],
        skills: [String],
        education: [String],
        certifications: [String],
        companyName: String,
        companyInfo: String,
        companyLink: String,
        pastProjects: [String]
    },
    // Freelancer-specific stats
    totalEarnings: {
        type: Number,
        default: 0
    },
    activeProjects: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    }
},{timestamps:true});

export default mongoose.model('User',userSchema);