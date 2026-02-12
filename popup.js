// Gerenciar tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    
    // Remover active de todos
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Adicionar active no clicado
    btn.classList.add('active');
    document.getElementById(tabName).classList.add('active');
  });
});

// Carregar dados salvos ao abrir o popup
document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.sync.get(['userData', 'autoFillEnabled']);
  
  if (data.userData) {
    const form = document.getElementById('userForm');
    Object.keys(data.userData).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = data.userData[key];
      }
    });
  }
  
  if (data.autoFillEnabled !== undefined) {
    document.getElementById('autoFillEnabled').checked = data.autoFillEnabled;
  }
});

// Salvar dados do formulário
document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const userData = {};
  
  for (let [key, value] of formData.entries()) {
    userData[key] = value;
  }
  
  try {
    await chrome.storage.sync.set({ userData });
    showStatus('Dados salvos com sucesso!', 'success');
  } catch (error) {
    showStatus('Erro ao salvar dados.', 'error');
  }
});

// Salvar configuração de auto-fill
document.getElementById('autoFillEnabled').addEventListener('change', async (e) => {
  try {
    await chrome.storage.sync.set({ autoFillEnabled: e.target.checked });
    showStatus('Configuração salva!', 'success');
  } catch (error) {
    showStatus('Erro ao salvar configuração.', 'error');
  }
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  
  setTimeout(() => {
    status.className = 'status';
  }, 3000);
}