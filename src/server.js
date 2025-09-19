import express from "express";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import router from "./routes/authRoutes.js";
dotenv.config();

const PORT = process.env.PORT || 3000;
// const __dirname = path.resolve();
const app = express();

if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "*",
    })
  );
}
app.use(express.json());
app.use("/api/auth", router);

// app.use("/api/notes", notesRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
