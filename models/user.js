const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");

const userSchema = new Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		salt: {
			type: String,
			required: true,
		},
		profileImage: {
			type: String,
			default: "/images/default_profile_image",
		},
		role: {
			type: String,
			enum: ["admin", "user"],
			default: "user",
		},
	},
	{ timestamps: true }
);

// Hashing password
userSchema.pre("save", function (next) {
	const user = this;
	if (!user.isModified("password")) return;

	const salt = randomBytes(16).toString();
	const hashedPassword = createHmac("sha256", salt)
		.update(user.password)
		.digest("hex");

	this.salt = salt;
	this.password = hashedPassword;

	next();
});

const User = model("user", userSchema);

module.exports = User;
