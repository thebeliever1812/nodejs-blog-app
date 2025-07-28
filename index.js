const express = require("express");
const path = require("path");
const userRoute = require("./routes/user");
const { connect } = require("mongoose");

const app = express();
const port = 8000;

connect("mongodb://127.0.0.1:27017/Blogg")
	.then(() => console.log(`MongoDb connected`))
	.catch((error) => console.log(`Error connecting MongoDb: ${error}`));

app.use(
	"/bootstrap",
	express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
);
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", (req, res) => {
	res.render("home");
});

app.use("/user", userRoute);

app.listen(port, (err) => {
	if (err) {
		console.log("Error in starting server: ", err);
		return;
	}
	console.log("Server started at PORT:", port);
});
