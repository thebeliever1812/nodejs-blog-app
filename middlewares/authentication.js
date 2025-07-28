const { validateToken } = require("../service/auth");

function checkForUserAuthentication(req, res, next) {
	const token = req.cookies?.userAuthToken;
	req.user = null;
	if (!token) {
		return next();
	}

	try {
		const userPayload = validateToken(token);
		if (userPayload) {
			req.user = userPayload
		}
	} catch (error) {
		console.error("Token validation error:", err.message);
	}
	next()
}

module.exports = { checkForUserAuthentication };
