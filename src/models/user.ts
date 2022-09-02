import mongoose from "mongoose";
import { Password } from "../services/password";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;

  isPasswordValid: (password: string) => Promise<boolean>;
}

const schemaOptions: mongoose.SchemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.password;
    },
  },
};

const schema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  schemaOptions
);

schema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.encrypt(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

schema.methods.isPasswordValid = async function (password: string) {
  const isPasswordValid = await Password.compare(this.password, password);
  return isPasswordValid;
};

export const User = mongoose.model<IUser>("User", schema);
