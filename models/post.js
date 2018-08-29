const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: String,
    body: String,
    coordinates: {
        type: [Number], 
        index: '2dsphere',
        default: [0, 0]
    }
}, 
{
    timestamps: true
});

schema.statics.findNear = async(coordinates, maxDistance) => {
    return Post.find({ coordinates: {
                        $near: {
                            $geometry: {
                                type: [Number],
                                coordinates: coordinates
                            },
                            $maxDistance: maxDistance
                        }
                    }
                }); 
};


const Post = mongoose.model('Post', schema);

module.exports = Post;