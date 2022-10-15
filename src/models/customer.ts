import mongoose from "mongoose";
import { IUser } from "./user";

export interface ICustomer extends mongoose.Document {
  user: IUser;
}

const schemaOptions: mongoose.SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
    },
  },
};

const schema = new mongoose.Schema<ICustomer>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  schemaOptions
);

export const Customer = mongoose.model<ICustomer>("Customer", schema);
