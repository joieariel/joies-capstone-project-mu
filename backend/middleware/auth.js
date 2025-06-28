const { supabase } = require('../supabaseClient');

// auth middleware to verify supabase jwt tokens
const authenticateUser = async (req, res, next) => {
  try {
    // get auth header from the request
    const authHeader = req.headers.authorization;

    // check if authoriation header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided or invalid format.'
      });
    }

    // extract just the token from the header which comes after Bearer (7 chars)
    const token = authHeader.substring(7);

    // verify the JWT token with supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid or expired token.'
      });
    }

    // attach user information to the request object
    // makes user data available in route handlers
    req.user = user;

    // continue to the next middleware or route handler
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Internal server error during authentication.'
    });
  }
};

module.exports = { authenticateUser };
