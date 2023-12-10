import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema({
    name: String,
    email: String,
    phoneNumber: String,
    paid: Boolean,
}, {
    timestamps: true,
});

export const Order = models?.Order || model('Order', OrderSchema);