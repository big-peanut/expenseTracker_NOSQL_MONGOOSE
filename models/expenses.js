const mongoose=require('mongoose')

const Schema=mongoose.Schema

const expenseSchema=new Schema({
    amount:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    userID:{
        type: Schema.Types.ObjectId, 
        ref: 'Users', 
        required: true
    }
})

module.exports=mongoose.model('Expenses',expenseSchema)