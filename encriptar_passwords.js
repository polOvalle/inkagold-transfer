const bcrypt = require('bcrypt');

const usuarios = {
  'admin': '12345',
  'usuario_cusco': 'cusco123',
  'usuario_juliaca': 'juliaca123',
  'usuario_arequipa': 'arequipa123',
  'usuario_lima': 'lima123',
  'usuario_tacna': 'tacna123'
};

console.log('CONTRASEÑAS ENCRIPTADAS:\n');

Object.entries(usuarios).forEach(([usuario, password]) => {
  const hash = bcrypt.hashSync(password, 10);
  console.log(`Usuario: ${usuario}`);
  console.log(`Hash: ${hash}\n`);
});
