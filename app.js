if (!process.env.NODE_ENV || process.env.NODE_ENV === "developement" || process.env.NODE_ENV === "devlopement") {
  process.env.NODE_ENV = "development";
}

require("dotenv").config();

const express = require("express");
const app = express();
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const db = require("./config/mongoose-connection");
const indexRouter = require("./routes/index");
const ownersRouter = require("./routes/ownersRouter");
const productsRouter = require("./routes/productsRouter");
const usersRouter = require("./routes/usersRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET || "shopping-bag-secret-key",
  })
);

// Custom robust flash message middleware
app.use((req, res, next) => {
  if (!req.session) req.session = {};
  if (!req.session.flash) req.session.flash = {};

  req.flash = function (type, message) {
    if (message !== undefined) {
      req.session.flash[type] = message;
    } else {
      const msg = req.session.flash[type] || "";
      delete req.session.flash[type];
      return msg;
    }
  };
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/owners", ownersRouter);
app.use("/products", productsRouter);

app.use((req, res) => {
  res.status(404).send("Route not found");
});

const port = Number(process.env.PORT) || 3000;

const startServer = (currentPort) => {
  const server = app.listen(currentPort, () => {
    console.log(`Server running on http://localhost:${currentPort}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = currentPort + 1;
      console.warn(`Port ${currentPort} is already in use. Trying ${nextPort} instead.`);
      startServer(nextPort);
    } else {
      console.error(error);
      process.exit(1);
    }
  });
};

startServer(port);