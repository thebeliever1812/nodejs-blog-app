const express = require("express");
const path = require("path");

const app = express();
const port = 8000;

app.use(
	"/bootstrap",
	express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", (req, res) => {
	res.render("home");
});

app.listen(port, (err) => {
	if (err) {
		console.log("Error in starting server: ", err);
		return;
	}
	console.log("Server started at PORT:", port);
});
