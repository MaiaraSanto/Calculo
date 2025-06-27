// Funções básicas
const loadUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));
const showSection = (id) => {
  document.querySelectorAll('.form-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
};
const generateId = () => Math.random().toString(36).substr(2, 9);

// Cadastro
document.getElementById('register-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const name = formData.get('name');
  const email = formData.get('email');
  const login = formData.get('login');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const role = formData.get('role');

  if (!role) {
    alert('Selecione um cargo.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Senhas não coincidem.');
    return;
  }

  const users = loadUsers();
  if (users.some(u => u.login === login)) {
    alert('Este login já existe.');
    return;
  }

  const user = { id: generateId(), name, email, login, password, role, isFirstAccess: true };
  users.push(user);
  saveUsers(users);

  // Salva quem está aguardando o link de ativação
  localStorage.setItem('pendingActivation', JSON.stringify({ login, password }));

  // Mostra mensagem de email enviado com um link de simulação
  document.getElementById('email-verification-screen').querySelector('.info-text').innerHTML = `
    Cadastro feito com sucesso! Um link foi enviado para seu e-mail.<br><br>
    <a href="?activate=true">👉 Clique aqui para simular o link do e-mail</a>
  `;

  showSection('email-verification-screen');
});

// Se a URL tiver o parâmetro ?activate=true
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('activate') === 'true') {
    showSection('change-credentials-screen');
  }
});

// Alteração de Credenciais - Confirma o login e a senha da primeira tela
document.getElementById('change-credentials-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const newLogin = formData.get('newLogin');
  const newPassword = formData.get('newPassword');
  const confirmNewPassword = formData.get('confirmNewPassword');

  if (newPassword !== confirmNewPassword) {
    alert('As novas senhas não coincidem.');
    return;
  }

  const pending = JSON.parse(localStorage.getItem('pendingActivation'));
  if (!pending) {
    alert('Erro: Nenhum cadastro aguardando ativação.');
    showSection('register-screen');
    return;
  }

  // O usuário precisa digitar os mesmos login e senha da primeira tela
  if (newLogin !== pending.login || newPassword !== pending.password) {
    alert('Login ou senha incorretos. Precisa ser o mesmo que foi cadastrado.');
    return;
  }

  const users = loadUsers();
  const index = users.findIndex(u => u.login === pending.login && u.password === pending.password);

  if (index === -1) {
    alert('Usuário não encontrado.');
    return;
  }

  users[index].isFirstAccess = false;
  saveUsers(users);
  localStorage.removeItem('pendingActivation');

  alert('Alteração validada! Agora faça o login.');
  showSection('login-screen');
});

// Login Final
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const login = formData.get('login');
  const password = formData.get('password');
  const users = loadUsers();
  const user = users.find(u => u.login === login && u.password === password && !u.isFirstAccess);

  if (!user) {
    alert('Login ou senha inválidos, ou você ainda não ativou seu cadastro.');
    return;
  }

  alert('Login bem-sucedido. Bem-vindo ao sistema!');
});
