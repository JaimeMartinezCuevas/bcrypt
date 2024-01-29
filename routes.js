const express = require('express');
const router = express.Router();
const { generateToken, verifyToken } = require('./authMiddleware');
const users = require('./users');

router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.send('Página de inicio - Formulario de inicio de sesión');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && bcrypt.compareSync(password, u.password));

  if (user) {
    const token = generateToken({ id: user.id, username: user.username });
    req.session.user = user;
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

router.get('/dashboard', (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  res.send(`Panel de control - Bienvenido, ${decoded.username}!`);
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.send('Sesión cerrada exitosamente');
});


app.get('/dashboard', (req, res) => {
  verifyToken(req, res, () => {
    const userId = req.user;
    const user = users.find((user) => user.id === userId);

    if (user) {
      res.send(`
        <h1>Bienvenido, ${user.name}</h1>
        <p>ID: ${user.id}</p>
        <p>UserName: ${user.username}</p>
        <a href="/login">HOME</a>
        <form action="/logout" method="post">
          <button type="submit">Salir de la sesión</button>
        </form>
      `);
    } else {
      res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }
  }, hashedSecret);
});

app.post('/logout', (req, res) => {
req.session.destroy();
res.redirect('/');
});

module.exports = router;
