const jwt = require("jsonwebtoken");
const secret = "Basir@admin";

function getTokenForUser(user) {
	const payload = {
		_id: user._id,
		email: user.email,
		profileImage: user.profileImage,
		role: user.role,
	};
	return jwt.sign(payload, secret, { expiresIn: "1d" });
}

function validateToken(token) {
	try {
		const payload = jwt.verify(token, secret);
		return payload;
	} catch (error) {
		return null;
	}
}

module.exports = { getTokenForUser, validateToken };
