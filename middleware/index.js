// Prevent logged in users from accessing a route:
function loggedOut(req, res, next) {
  // check for session and user id value:
  if (req.session && req.session.userID) {
    // user is logged in, send to profile page:
    return res.redirect('/profile');
  }
  // if visitor is not logged in, this function won't do anything.
  return next();
}

function requiresLogin(req, res, next) {
  if (req.session) {
    return next();
  } else {
    const err = new Error ("You are required to login to view the page.");
    err.status = 403;
    next(err);
  }

}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
