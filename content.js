// Content script que roda em todas as páginas
(async function() {
  // Carregar configurações
  const { autoFillEnabled, userData } = await chrome.storage.sync.get(['autoFillEnabled', 'userData']);
  
  if (!autoFillEnabled || !userData) return;

  // Mapeamento de campos comuns em formulários de cadastro
  const fieldMappings = {
    // Nome
    nome: ['name', 'nome', 'fullname', 'full-name', 'full_name', 'nome-completo', 'nome_completo', 'candidate-name', 'candidatename', 'first name', 'last name'],
    
    // Email
    email: ['email', 'e-mail', 'mail', 'correo', 'emailaddress', 'email-address', 'email_address'],
    
    // Telefone
    telefone: ['phone', 'telefone', 'tel', 'telephone', 'celular', 'mobile', 'phonenumber', 'phone-number', 'phone_number'],
    
    // LinkedIn
    linkedin: ['linkedin', 'linkedin-url', 'linkedin_url', 'linkedinprofile', 'linkedin-profile'],
    
    // GitHub
    github: ['github', 'github-url', 'github_url', 'githubprofile', 'github-profile'],
    
    // Portfolio
    portfolio: ['portfolio', 'website', 'site', 'portfolio-url', 'portfolio_url', 'personal-website'],
    
    // Endereço
    endereco: ['address', 'endereco', 'endereço', 'street', 'rua', 'street-address', 'address-line-1'],
    
    // Cidade
    cidade: ['city', 'cidade', 'town', 'locality'],
    
    // Estado
    estado: ['state', 'estado', 'province', 'region', 'uf'],
    
    // CEP
    cep: ['zip', 'zipcode', 'zip-code', 'postal', 'postalcode', 'postal-code', 'cep']
  };

  // Função para preencher campos
  function fillForm() {
    let filledCount = 0;

    Object.keys(fieldMappings).forEach(dataKey => {
      const value = userData[dataKey];
      if (!value) return;

      const possibleNames = fieldMappings[dataKey];
      
      // Tentar encontrar o campo por diferentes atributos
      possibleNames.forEach(fieldName => {
        // Por name
        let inputs = document.querySelectorAll(`input[name*="${fieldName}" i], textarea[name*="${fieldName}" i]`);
        
        // Por id
        if (inputs.length === 0) {
          inputs = document.querySelectorAll(`input[id*="${fieldName}" i], textarea[id*="${fieldName}" i]`);
        }
        
        // Por placeholder
        if (inputs.length === 0) {
          inputs = document.querySelectorAll(`input[placeholder*="${fieldName}" i], textarea[placeholder*="${fieldName}" i]`);
        }

        // Por aria-label
        if (inputs.length === 0) {
          inputs = document.querySelectorAll(`input[aria-label*="${fieldName}" i], textarea[aria-label*="${fieldName}" i]`);
        }

        inputs.forEach(input => {
          // Não preencher se já tiver valor
          if (input.value && input.value.trim() !== '') return;
          
          // Verificar se o tipo do input é compatível
          const inputType = input.type.toLowerCase();
          if (inputType === 'text' || inputType === 'email' || inputType === 'tel' || 
              inputType === 'url' || input.tagName.toLowerCase() === 'textarea') {
            
            input.value = value;
            
            // Disparar eventos para frameworks como React/Vue detectarem a mudança
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Adicionar visual feedback
            input.style.backgroundColor = '#e7f3ff';
            setTimeout(() => {
              input.style.backgroundColor = '';
            }, 2000);
            
            filledCount++;
          }
        });
      });
    });

    if (filledCount > 0) {
      showNotification(`${filledCount} campos preenchidos automaticamente!`);
    }
  }

  // Mostrar notificação
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1a73e8;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Atalho de teclado: Ctrl+Shift+F
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      fillForm();
    }
  });

  // Tentar preencher automaticamente quando detectar um formulário
  // Aguardar um pouco para o formulário carregar completamente
  setTimeout(() => {
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
      fillForm();
    }
  }, 1500);

  // Observer para detectar formulários carregados dinamicamente
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (node.tagName === 'FORM' || node.querySelector('form')) {
            setTimeout(fillForm, 500);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();