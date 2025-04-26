const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
      const userPermissions = req.user.permissions || [];
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Accesso negato: permesso mancante' });
      }
      next();
    };
  };
  
  module.exports = { checkPermission };
  