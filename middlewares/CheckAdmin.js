const checkAdmin = (req, res, next) => {
    console.log('User data in request:', req.user);

    if (req.user && (req.user.role === 'admin' || req.user.role === 'sup-admin')) {
        next();
    } else {
        res.status(403).json({
            message: 'Access denied. Admins only.',
            "your role is": req.user?.role || 'No role found'
        });
    }
};

module.exports = checkAdmin;
