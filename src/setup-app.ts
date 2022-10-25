import express from "express";
import { handleException } from "./middlewares/handle-exception";
import { handleInvalidRoute } from "./middlewares/handle-invalid-route";
import { router as userRouter } from "./routes/user";
import { router as roleRouter } from "./routes/role";
import { router as employeeRouter } from "./routes/employee";
import { setupCors } from "./middlewares/setup-cors";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setupCors);

app.use("/api/user", userRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/role", roleRouter);
app.use(handleInvalidRoute);
app.use(handleException);
