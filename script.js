// Carregar usuários do localStorage
const loadUsers = () => JSON.parse(localStorage.getItem('users') || '[]');

// Salvar usuários no localStorage
const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));

// Mostrar uma seção e ocultar outras
function showSection(sectionId) {
  document.querySelectorAll('.form-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
}

// Gerar ID único
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Validação de senha forte (mínimo 8 caracteres)
function isValidPassword(password) {
  return password.length >= 8;
}

// Registro de usuário
document.getElementById('register-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const user = {
    id: generateId(),
    name: formData.get('name'),
    email: formData.get('email'),
    login: formData.get('login'),
    password: formData.get('password'),
    role: formData.get('role'),
    isFirstAccess: true
  };

  const confirmPassword = formData.get('confirmPassword');
  
  if (user.password !== confirmPassword) {
    alert('As senhas não coincidem.');
    return;
  }

  const users = loadUsers();
  users.push(user);
  saveUsers(users);
  alert('Usuário cadastrado com sucesso!');
  this.reset();
  showSection('login-screen');
});

// Login
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const login = formData.get('login');
  const password = formData.get('password');
  const users = loadUsers();
  const user = users.find(u => u.login === login && u.password === password);

  if (!user) {
    alert('Credenciais inválidas');
    return;
  }

  if (user.isFirstAccess) {
    // Armazenar login temporário para alteração
    localStorage.setItem('pendingUser', login);
    showSection('change-credentials-screen');
  } else {
    alert('Bem-vindo ao sistema!');
  }
});

// Alteração de credenciais
document.getElementById('change-credentials-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const newLogin = formData.get('newLogin');
  const newPassword = formData.get('newPassword');
  const confirmNewPassword = formData.get('confirmNewPassword');
  const pendingLogin = localStorage.getItem('pendingUser');
  
  if (newPassword !== confirmNewPassword) {
    alert('As novas senhas não coincidem.');
    return;
  }

  const users = loadUsers();
  const userIndex = users.findIndex(u => u.login === pendingLogin);
  
  if (userIndex === -1) return;

  users[userIndex].login = newLogin;
  users[userIndex].password = newPassword;
  users[userIndex].isFirstAccess = false;

  saveUsers(users);
  localStorage.removeItem('pendingUser');
  alert('Credenciais atualizadas com sucesso!');
  this.reset();
  showSection('login-screen');
});