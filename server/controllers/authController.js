const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nella registrazione' });
  }
};

const login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Credenziali non valide' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Credenziali non valide' });
      }
  
      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // metti true in produzione con HTTPS
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 giorni
      });
  
      res.json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Errore nel login' });
    }
  };

const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        return res.status(404).json({ message: 'Email non trovata' });
      }
  
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 ora di validità
  
      await prisma.user.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
  
      const resetUrl = `http://localhost:5173/reset-password/${resetToken}`; // Frontend URL
      const message = `Hai richiesto il reset della password. Clicca su questo link per procedere: \n\n ${resetUrl}`;
  
      await sendEmail({
        email: user.email,
        subject: 'Reset Password richiesta',
        message,
      });
  
      res.status(200).json({ message: 'Email di reset inviata con successo' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Errore nel reset password' });
    }
  };

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    try {
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Token non valido o scaduto' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
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

const refreshAccessToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token mancante' });
  
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Refresh token non valido' });
  
      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      res.json({ accessToken });
    });
  };

const logout = (req, res) => {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false, 
      sameSite: 'Strict',
    });
    res.json({ message: 'Logout effettuato' });
  };

module.exports = { signup, login, resetPassword, forgotPassword, refreshAccessToken, logout };
