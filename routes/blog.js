const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const { Blog } = require("../models/blog");
const Comment = require("../models/comment");
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

router.post("/comment/:blogId", async (req, res) => {
	try {
		const blogId = req.params.blogId;
		if (!mongoose.Types.ObjectId.isValid(blogId)) {
			throw new Error("Blog id is not valid");
		}

		if (!req.body.comment || req.body.comment.trim() === "") {
			throw new Error("Comment cannot be empty");
		}

		await Comment.create({
			comment: req.body.comment,
			createdBy: req.user._id,
			blog: blogId,
		});

		res.redirect(`/blog/${blogId}`);
	} catch (error) {
		try {
			const blog = await Blog.findById(req.params.blogId).populate("createdBy");
			const comments = await Comment.find({ blog: req.params.blogId }).populate(
				"createdBy"
			);

			res.render("blog", {
				blog,
				comments,
				user: req.user,
				error: error.message,
			});
		} catch (innerErr) {
			// If fetching blog or comments also fails
			res.render("home", {
				error: "Something went wrong",
				user: req.user,
			});
		}
	}
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

		const blogComments = await Comment.find({ blog: blogId }).populate(
			"createdBy"
		);
		res.render("blog", {
			blog: blog,
			user: req.user,
			comments: blogComments,
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
