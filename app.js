if (!process.env.NODE_ENV || process.env.NODE_ENV === "developement" || process.env.NODE_ENV === "devlopement") {
  process.env.NODE_ENV = "development";
}

const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const path = require("path");
const db = require("./config/mongoose-connection");
const indexRouter = require("./routes/index");
const ownersRouter=require("./routes/ownersRouter");
const productsRouter=require("./routes/productsRouter");
const usersRouter=require("./routes/usersRouter");


require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/", indexRouter);
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");






const port = Number(process.env.PORT) || 3000;

const startServer = (currentPort) => {
  const server = app.listen(currentPort, () => {
    console.log(`Server running on http://localhost:${currentPort}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${currentPort} is already in use. Stop the other process or use a different PORT.`);
      process.exit(1);
    } else {
      console.error(error);
      process.exit(1);
    }
  });
};

startServer(port);