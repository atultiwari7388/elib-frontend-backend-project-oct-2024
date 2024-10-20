import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";

const app = express();
app.use(express.json());

// Routes
app.get("/", (req, res) => {
   res.json({ message: "Welcome to Elib Apis" });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);
// Use global error handler
app.use(globalErrorHandler);

export default app;
