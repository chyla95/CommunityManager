import mongoose from "mongoose";

export interface IRole extends mongoose.Document {
  name: string;
  permissions: {
    users: {
      manage: boolean;
    };
    roles: {
      manage: boolean;
    };
  };
}

const schemaOptions: mongoose.SchemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
    },
  },
};

const schema = new mongoose.Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    permissions: {
      users: {
        manage: { type: Boolean },
        // TODO: manageAll vs manageOwn vs manageSelf
      },
      roles: {
        manage: { type: Boolean },
      },
    },
  },
  schemaOptions
);

export const Role = mongoose.model<IRole>("Role", schema);

// End of mongoose model

export enum Permissions {
  ManageUsers,
  ManageRoles,
}
