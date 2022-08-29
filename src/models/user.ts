import mongoose from "mongoose";
import { Password } from "../services/password";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

const UserModel = mongoose.model("User", userSchema);

interface IUser {
  email: string;
  password: string;
}

export class User extends UserModel {
  constructor(parameters: IUser) {
    super(parameters);
  }
}
