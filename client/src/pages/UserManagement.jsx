import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import PasswordChecklist from 'react-password-checklist';

function UserManagement() {
  const { permissions } = useAuth();
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newPermissions, setNewPermissions] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserPermissions, setNewUserPermissions] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);


  useEffect(() => {
    if (permissions.includes('canViewUsers')) {
      fetchUsers();
    }
  }, [permissions]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Errore nel recuperare utenti:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setNewRole(user.role);
    setNewPermissions(user.permissions.join(','));
  };

  const handleSave = async (id) => {
    try {
      const permissionsArray = newPermissions.split(',').map(p => p.trim());
      await axios.put(`/users/${id}`, {
        role: newRole,
        permissions: permissionsArray,
      });
      alert('Utente aggiornato!');
      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Errore nell\'aggiornare l\'utente:', error);
      alert('Errore');
    }
  };

  if (!permissions.includes('canViewUsers')) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const permissionsArray = newUserPermissions.split(',').map((p) => p.trim());
      await axios.post('/users', {
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        permissions: permissionsArray,
      });
      alert('Nuovo utente creato!');
      // Reset dei campi
      setNewUserEmail('');
      setNewUserPassword('');
      setConfirmPassword('');
      setNewUserRole('user');
      setNewUserPermissions('');
      fetchUsers();
    } catch (error) {
      console.error('Errore nella creazione utente:', error);
      alert('Errore nella creazione');
    }
  };
  

  return (
    <div>
      <h2>Gestione Utenti</h2>
      <h3>Crea nuovo utente</h3>
      <form onSubmit={handleCreateUser}>
        <input 
          type="email" 
          placeholder="Email" 
          value={newUserEmail} 
          onChange={(e) => setNewUserEmail(e.target.value)}
          required
        /> <br />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={newUserPassword} 
          onChange={(e) => setNewUserPassword(e.target.value)}
          required
        /> <br />
  
        <input 
          type="password" 
          placeholder="Conferma Password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        /> <br />
  
        <PasswordChecklist
          rules={['minLength', 'specialChar', 'number', 'capital', 'match']}
          minLength={8}
          value={newUserPassword}
          valueAgain={confirmPassword}
          onChange={(isValid) => setIsPasswordValid(isValid)}
          messages={{
            minLength: 'La password deve contenere almeno 8 caratteri.',
            specialChar: 'La password deve contenere almeno un carattere speciale.',
            number: 'La password deve contenere almeno un numero.',
            capital: 'La password deve contenere almeno una lettera maiuscola.',
            match: 'Le password devono coincidere.',
          }}
        /> <br />
  
        <input 
          type="text" 
          placeholder="Ruolo (es. user, admin)" 
          value={newUserRole} 
          onChange={(e) => setNewUserRole(e.target.value)}
        /> <br />
  
        <input 
          type="text" 
          placeholder="Permessi (es. canViewProducts,canEditExpenses)" 
          value={newUserPermissions} 
          onChange={(e) => setNewUserPermissions(e.target.value)}
        /> <br />
  
        <button type="submit" disabled={!isPasswordValid}>
          Crea Utente
        </button>
      </form>
  
      <hr />
  
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Ruolo</th>
            <th>Permessi</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>
                {editingUserId === user.id ? (
                  <input 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <input 
                    value={newPermissions}
                    onChange={(e) => setNewPermissions(e.target.value)}
                  />
                ) : (
                  user.permissions.join(', ')
                )}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <button onClick={() => handleSave(user.id)}>Salva</button>
                ) : (
                  <button onClick={() => handleEdit(user)}>Modifica</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
