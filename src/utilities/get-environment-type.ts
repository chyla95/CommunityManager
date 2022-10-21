import { Express } from "express";
import { SystemError } from "../errors/system-error";

export enum Environment {
  Development = "Development",
  Production = "Production",
}

export const getEnvironmentType = (app: Express) => {
  const environment: string = app.get("env");
  switch (environment) {
    case "development":
      return Environment.Development;
    case "production":
      return Environment.Production;
    default:
      throw new SystemError("Unknown Environment Type!");
  }
};
