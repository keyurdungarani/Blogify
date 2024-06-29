import { Schema, model } from "mongoose";

const commentSchma = new Schema({
    content: {
        type: String,
        required: true,
    },
    blogId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
},{timestamps: true});

const Comment = model('Comment', commentSchma);

export { Comment };