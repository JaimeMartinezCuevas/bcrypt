const jwt = require('jsonwebtoken');

function generateToken(user, secret) {
  return jwt.sign({ user: user.id }, secret, {
    expiresIn: '1h',
  });
}

function verifyToken(req, res, next, secret) {
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({ mensaje: 'El token no se ha generado' });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }
    req.user = decoded.user;

    next();
  });
}

module.exports = {
  generateToken,
  verifyToken,
};
