
//verifying function if an admin or super admin who's connected to allow deletUser action
const admineRole = (user, allowedRoles = ['admin', 'sup-admin']) =>{
    if (!user || !allowedRoles.includes(user.role)) {
        return {
            authorized: false,
            message: "Log in as admin or super admin to have access!",
            role: user ? user.role : "No user connected"
        };
    }
    return { authorized: true };
}

module.exports = { admineRole };