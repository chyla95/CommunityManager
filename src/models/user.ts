import mongoose from "mongoose";
import { Password } from "../services/password";

const schemaOptions: mongoose.SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.password;
    },
  },
};

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
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

const UserModel = mongoose.model("User", schema);

interface IUser {
  email: string;
  password: string;
}

export class User extends UserModel {
  createdAt: any;
  updatedAt: any;

  constructor(parameters: IUser) {
    super(parameters);
  }

  isPasswordValid = async (password: string) => {
    const isPasswordValid = await Password.compare(this.password, password);
    return isPasswordValid;
  };
}
