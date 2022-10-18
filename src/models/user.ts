import mongoose from "mongoose";
import { Password } from "../services/password";
import { isEmail } from "../utilities/validators/is-email";
import { isHashtagTag } from "../utilities/validators/is-hashtag-tag";
import { isUrl } from "../utilities/validators/is-url";
import { ICustomer } from "./customer";
import { IEmployee } from "./employee";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  avatarImage: string;
  discordTag: string;
  battleTag: string;
  status: string;
  function: {
    employee: IEmployee;
    customer: ICustomer;
  };

  isPasswordValid: (password: string) => Promise<boolean>;
}

export enum AccountStatus {
  Active = "Active",
  Suspended = "Suspended",
}

const schemaOptions: mongoose.SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
      delete ret.password;
    },
  },
};

const schema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, validate: [isEmail, 'Invalid "email" Value!'] },
    password: { type: String, required: true },
    avatarImage: { type: String, validate: [isUrl, 'Invalid "avatarImage" Value!'] },
    discordTag: { type: String, validate: [isHashtagTag, 'Invalid "discordTag" Value!'] },
    battleTag: { type: String, validate: [isHashtagTag, 'Invalid "battleTag" Value!'] },
    status: { type: String, required: true, enum: AccountStatus, default: AccountStatus.Active },
    function: {
      employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        unique: true,
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        unique: true,
      },
    },
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
