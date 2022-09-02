import { scrypt, randomBytes } from "crypto";
import * as bcrypt from "bcrypt";

import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  static async encrypt(password: string) {
    // const salt = randomBytes(8).toString("hex");
    // const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
    // return `${buffer.toString("hex")}.${salt}`;

    return await bcrypt.hash(password, 10);
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    // const [hashedPassword, salt] = storedPassword.split(".");
    // const buffer = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    // return buffer.toString("hex") === hashedPassword;

    return await bcrypt.compare(suppliedPassword, storedPassword);
  }
}
