const { Router } = require("express");
const { createHmac } = require("crypto");

const User = require("../models/user");

const router = Router();

router.get("/signin", (req, res) => {
	res.render("signin");
});

router.get("/signup", (req, res) => {
	res.render("signup");
});

router.post("/signup", async (req, res) => {
	try {
		const { fullName, email, password } = req.body;
		if (!fullName || !email || !password) {
			return res.render("signup", {
				error: "All fields required",
			});
		}
		await User.create({
			fullName,
			email,
			password,
		});
		res.redirect("/");
	} catch (error) {
		console.log("Error in signup:", error);
		return res.render("signup", {
			error: "Something went wrong. Please try again.",
		});
	}
});

router.post("/signin", async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			throw new Error("All fields are required");
		}

        const user = await User.matchPassword({ email, password });
        // Generate Token

		return res.redirect("/");
	} catch (error) {
		console.log("Error in signin:", error);
		return res.render("signin", {
			error: error.message,
		});
	}
});

module.exports = router;
