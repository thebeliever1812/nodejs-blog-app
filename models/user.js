const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { getTokenForUser } = require("../service/auth");

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

userSchema.static(
	"matchPasswordAndReturnToken",
	async function ({ email, password }) {
		const user = await this.findOne({ email });
		if (!user) {
			throw new Error("User Not Found");
		}

		const hashLoginPassword = createHmac("sha256", user.salt)
			.update(password)
			.digest("hex");

		if (hashLoginPassword !== user.password) {
			throw new Error("Incorrect Password");
		}
		const token = getTokenForUser(user);
		return token;
	}
);

const User = model("user", userSchema);

module.exports = User;
