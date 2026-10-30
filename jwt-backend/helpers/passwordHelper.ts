import bcrypt from "bcrypt";

async function HashPassword(password: string) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject("Error al encriptar la contraseña");
      resolve(hash);
    });
  });
}
async function ComparePassword(password: string, hash: string) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) reject("Datos no válidos");
      resolve(res);
    });
  });
}

export default { HashPassword, ComparePassword };
