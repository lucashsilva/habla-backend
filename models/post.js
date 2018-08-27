const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: String,
    body: String
}, 
{
    timestamps: true
});

module.exports = mongoose.model('Post', schema);