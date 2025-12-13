import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{type:String,required:true},
    category:{type:mongoose.Schema.Types.ObjectId,ref:"Category",requires:true},
    unit :{type:mongoose.Schema.Types.ObjectId,ref:"Unit",required:true},
    price:{type:Number,required:true},
    stock:{type:Number,default:0},
    description:{type:String},
    image:{type:String},
},
{
    timestamps:true,
})
export default mongoose.model("Product",productSchema); 