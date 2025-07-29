const express = require("express");
const path = require("path");
const userRoute = require("./routes/user");
const { connect } = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForUserAuthentication } = require("./middlewares/authentication");
const blogRoute = require("./routes/blog");
const { Blog } = require("./models/blog");

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
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));
app.use(checkForUserAuthentication);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", async (req, res) => {
	try {
		const allBlogs = await Blog.find().populate('createdBy', "fullName");
		res.render("home", {
			user: req.user,
			blogs: allBlogs || [],
		});
	} catch (error) {
		res.status(500).render("error", {
			message: "Failed to load blogs. Please try again later.",
			error,
		});
	}
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(port, (err) => {
	if (err) {
		console.log("Error in starting server: ", err);
		return;
	}
	console.log("Server started at PORT:", port);
});
