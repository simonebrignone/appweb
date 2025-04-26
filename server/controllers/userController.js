const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lista tutti gli utenti (solo admin o chi ha permesso)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel recuperare gli utenti' });
  }
};

// Modifica ruolo e permessi di un utente
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, permissions } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        role,
        permissions,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nell\'aggiornare l\'utente' });
  }
};

const createUser = async (req, res) => {
    const { email, password, role, permissions } = req.body;
    const bcrypt = require('bcrypt');
  
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email già registrata' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role || 'user',
          permissions: permissions || [],
        },
      });
  
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Errore nella creazione utente' });
    }
  };
  
  module.exports = { getAllUsers, updateUser, createUser };
  

module.exports = { getAllUsers, updateUser };
