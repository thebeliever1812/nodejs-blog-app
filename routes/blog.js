const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const { Blog } = require("../models/blog");
const { default: mongoose } = require("mongoose");

const router = Router();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.resolve(`./public/uploads`));
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_");
		const uniqueSuffix = Date.now();
		cb(null, `${baseName}-${uniqueSuffix}${ext}`);
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 2 * 1000000 },
});

router.post("/", upload.single("coverImage"), async (req, res) => {
	try {
		const { title, body } = req.body;
		if (!title || !body) {
			throw new Error("All fields required");
		}

		if (!req.file) {
			throw new Error("Cover image is required.");
		}

		const blog = await Blog.create({
			title,
			body,
			createdBy: req.user._id,
			coverImage: `/uploads/${req.file.filename}`,
		});
		res.redirect(`/blog/${blog._id}`);
	} catch (error) {
		res.render("addBlog", {
			error: error.message,
			user: req.user,
			title: req.body.title || "",
			body: req.body.body || "",
		});
	}
});

router.get("/add-blog", (req, res) => {
	res.render("addBlog", {
		user: req.user,
		title: "", // default empty string
		body: "", // default empty string
		coverImage: null, // no image
		error: null,
	});
});

router.get("/:blogId", async (req, res) => {
	try {
		const blogId = req.params.blogId;

		if (!mongoose.Types.ObjectId.isValid(blogId)) {
			throw new Error("Blog id is not valid");
		}
		const blog = await Blog.findById(blogId).populate("createdBy");
		if (!blog) {
			throw new Error("Blog not found");
		}
		res.render("blog", {
			blog: blog,
			user: req.user,
		});
	} catch (error) {
		res.render("blog", {
			blog: null,
			error: error.message,
			user: req.user,
		});
	}
});

module.exports = router;
