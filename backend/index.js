const express = require("express");
const app = express();
const PORT = 3000;
const cors = require("cors");

// import what users exported
const usersRouter = require("./routes/users");
const communityCentersRouter = require("./routes/communityCenters");
const reviewsRouter = require("./routes/reviews");




app.get("/", (req, res) => {
  res.send("Welcome to my app!");
});

app.use(express.json()); // alsows express to parse json
app.use(cors());
app.use("/users", usersRouter);
app.use("/communityCenters", communityCentersRouter);
app.use("/reviews", reviewsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
