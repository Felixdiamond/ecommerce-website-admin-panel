import { Schema, model, models, Types } from 'mongoose';

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    parent: {
        type: Types.ObjectId,
        ref: 'Category'
    },
    properties: {
        type: [{type: Object}]
    },
});

export const Category = models?.Category || model('Category', CategorySchema);