const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')

const userSchema = new mongoose.Schema({
    name: {
        type: String,  
        required: true  
    },
    email: {
        type: String,
        required: true,  
        unique: true      
    },
    password: {
        type: String,
        required: true   
    }
});

const User = mongoose.model('User', userSchema);


const medSchema = new mongoose.Schema({
    name: {
        type: String,  
        required: true  
    },
    price: {
        type: Number,
        required: true,  
    },
    stock: {
        type: Number,
        required: true   
    },
    date:{
        type:String,
        required:true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
        required: true  
    }
});

medSchema.plugin(mongoosePaginate);
const Medicine = mongoose.model('Medicine',medSchema)

module.exports = {User,Medicine};
