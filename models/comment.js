const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
	{
		comment: {
			type: String,
			required: true,
		},
		blog: {
			type: Schema.Types.ObjectId,
			ref: "blog",
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "user",
		},
	},
	{ timestamps: true }
);

const Comment = model("comment", commentSchema);

module.exports = Comment;
