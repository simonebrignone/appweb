const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const generator = require('generate-password');
const sendEmail = require('../utils/sendEmail');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// SIGNUP
const signup = async (req, res) => {
  const { email, username, password, fullname } = req.body;

  if (!email || !username || !password || !fullname) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email o Username già registrati' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        fullname,
        roles: ["expense_standard", "pantry_standard"]
      },
    });

    res.status(201).json({ message: 'Registrazione completata' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nella registrazione' });
  }
};

// LOGIN
const login = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }]
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    // 👇 AGGIUNGI QUESTO CONTROLLO
    if (user.mustChangePassword) {
      const passwordChangeToken = jwt.sign(
        { id: user.id, purpose: "password_change" },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    
      return res.status(403).json({
        message: "FORCE_PASSWORD_CHANGE",
        reason: "Devi cambiare la password prima di accedere.",
        passwordChangeToken
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, roles: user.roles, mustChangePassword: user.mustChangePassword},
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        username: user.username,
        fullname: user.fullname,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel login' });
  }
};


// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email richiesta' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'E-mail non registrata a sistema!' });
    }

    // Genera password random
    const newPassword = generator.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Salva la nuova password + opzionale flag per cambio obbligatorio
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, mustChangePassword: true },
    });

    const message = `Ecco la tua nuova password temporanea: ${newPassword}\n\nTi consigliamo di cambiarla dopo l'accesso.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Nuova Password Generata',
        message,
      });
    } catch (emailError) {
      console.error('Errore invio email:', emailError);
      return res.status(200).json({ message: 'Password cambiata ma invio email fallito' });
    }

    res.status(200).json({ message: 'Nuova password inviata via email' });
  } catch (error) {
    console.error('Errore forgot-password:', error);
    res.status(500).json({ message: 'Errore interno server' });
  }
};


// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token non valido o scaduto' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: 'Password aggiornata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore durante il reset della password' });
  }
};

const changePasswordForced = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Le password non coincidono' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.purpose !== "password_change") {
      return res.status(400).json({ message: "Token non valido per cambio password." });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) {
      return res.status(404).json({ message: "Utente non trovato." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, mustChangePassword: false }
    });

    // 🔥 LOGIN AUTOMATICO come nel login
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, roles: user.roles, mustChangePassword: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        username: user.username,
        fullname: user.fullname,
        roles: user.roles
      }
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Token non valido o scaduto' });
  }
};


// REFRESH TOKEN
const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token mancante' });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Refresh token non valido' });

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Refresh token non trovato o scaduto' });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ accessToken });
  });
};

// LOGOUT
const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await prisma.user.update({
        where: { id: decoded.id },
        data: { refreshToken: null }
      });
    } catch (err) {
      // Non valido → ignoriamo
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  res.json({ message: 'Logout effettuato' });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Le nuove password non coincidono" });
  }

  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "La vecchia password non è corretta" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    // 🔑 Genera nuovo accessToken
    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 📦 Torna accessToken + user
    res.status(200).json({
      message: "Password cambiata con successo",
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname, // se lo hai
        roles: user.roles
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore durante il cambio password" });
  }
};


module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
  changePassword,
  changePasswordForced
};
