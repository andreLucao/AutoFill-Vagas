// Content script que roda em todas as páginas
(async function() {
  // Carregar configurações
  const { autoFillEnabled, userData } = await chrome.storage.sync.get(['autoFillEnabled', 'userData']);

  if (!autoFillEnabled || !userData) return;

  // Mapeamento de campos comuns em formulários de cadastro
  const fieldMappings = {
    // Nome
    nome: [
      'name', 'nome', 'fullname', 'full-name', 'full_name', 'nome-completo', 'nome_completo',
      'candidate-name', 'candidatename', 'first name', 'last name', 'firstname', 'lastname',
      'first-name', 'last-name', 'first_name', 'last_name', 'applicant-name', 'applicantname',
      'nome_candidato', 'nome-candidato', 'your-name', 'yourname', 'nombre', 'nome_completo',
      'display-name', 'displayname', 'contact-name', 'contactname', 'user-name', 'username',
      'legal-name', 'legalname', 'candidate_name', 'person-name'
    ],

    // Email
    email: [
      'email', 'e-mail', 'mail', 'correo', 'emailaddress', 'email-address', 'email_address',
      'user-email', 'useremail', 'contact-email', 'contactemail', 'your-email', 'youremail',
      'work-email', 'workemail', 'personal-email', 'personalemail', 'emailid', 'email-id',
      'email_id', 'candidate-email', 'candidateemail', 'applicant-email', 'correo-electronico',
      'endereco-email', 'enderecoemail', 'e_mail', 'primary-email', 'primaryemail'
    ],

    // Telefone
    telefone: [
      'phone', 'telefone', 'tel', 'telephone', 'celular', 'mobile', 'phonenumber',
      'phone-number', 'phone_number', 'cell', 'cellphone', 'cell-phone', 'cell_phone',
      'mobile-phone', 'mobilephone', 'mobile_phone', 'contact-phone', 'contactphone',
      'your-phone', 'yourphone', 'whatsapp', 'telefono', 'numero-telefone', 'fone',
      'homephone', 'home-phone', 'workphone', 'work-phone', 'primary-phone', 'primaryphone',
      'numero-celular', 'numerocelular', 'numero_celular', 'phone-mobile', 'mobilenumber'
    ],

    // LinkedIn
    linkedin: [
      'linkedin', 'linkedin-url', 'linkedin_url', 'linkedinprofile', 'linkedin-profile',
      'linkedin_profile', 'linkedin-link', 'linkedinlink', 'linkedin-username', 'social-linkedin',
      'sociallinkedin', 'url-linkedin', 'perfil-linkedin', 'perfillinkedin'
    ],

    // GitHub
    github: [
      'github', 'github-url', 'github_url', 'githubprofile', 'github-profile', 'github_profile',
      'github-link', 'githublink', 'github-username', 'githubusername', 'social-github',
      'socialgithub', 'url-github', 'perfil-github', 'perfilgithub', 'git-hub'
    ],

    // Portfolio
    portfolio: [
      'portfolio', 'website', 'site', 'portfolio-url', 'portfolio_url', 'personal-website',
      'personalwebsite', 'personal_website', 'personal-site', 'personalsite', 'homepage',
      'home-page', 'webpage', 'web-page', 'blog', 'url', 'website-url', 'websiteurl',
      'site-pessoal', 'sitepessoal', 'portfolio-link', 'portfoliolink', 'your-website',
      'yourwebsite', 'online-portfolio', 'onlineportfolio'
    ],

    // Endereço
    endereco: [
      'address', 'endereco', 'endereço', 'street', 'rua', 'street-address', 'address-line-1',
      'addressline1', 'address_line_1', 'address-line1', 'streetaddress', 'street_address',
      'home-address', 'homeaddress', 'mailing-address', 'mailingaddress', 'full-address',
      'fulladdress', 'endereco-completo', 'enderecocompleto', 'logradouro', 'direccion',
      'residential-address', 'residentialaddress', 'current-address', 'currentaddress'
    ],

    // Cidade
    cidade: [
      'city', 'cidade', 'town', 'locality', 'ciudad', 'municipio', 'município',
      'home-city', 'homecity', 'address-city', 'addresscity', 'current-city', 'currentcity',
      'city-name', 'cityname', 'cidade-atual', 'cidadeatual'
    ],

    // Estado
    estado: [
      'state', 'estado', 'province', 'region', 'uf', 'estado-uf', 'estadouf',
      'address-state', 'addressstate', 'home-state', 'homestate', 'provincia',
      'state-province', 'stateprovince', 'administrative-area', 'administrativearea'
    ],

    // CEP
    cep: [
      'zip', 'zipcode', 'zip-code', 'postal', 'postalcode', 'postal-code', 'cep',
      'zip_code', 'postal_code', 'postcode', 'post-code', 'codigo-postal', 'codigopostal',
      'codigo_postal', 'zippostal', 'zip-postal', 'mailing-zip', 'mailingzip'
    ],

    // Nacionalidade
    nacionalidade: [
      'nationality', 'nacionalidade', 'citizenship', 'cidadania', 'country-of-birth',
      'countryofbirth', 'pais-nascimento', 'paisnascimento', 'nacionalidad',
      'citizen', 'national', 'country-citizenship', 'countrycitizenship'
    ],

    // Data de Nascimento
    dataNascimento: [
      'birthdate', 'birth-date', 'birth_date', 'dateofbirth', 'date-of-birth', 'date_of_birth',
      'dob', 'birthday', 'nascimento', 'data-nascimento', 'datanascimento', 'data_nascimento',
      'data-de-nascimento', 'datadenascimento', 'fecha-nacimiento', 'fechanacimiento',
      'born-date', 'borndate', 'birth-day', 'aniversario'
    ],

    // Gênero
    genero: [
      'gender', 'genero', 'gênero', 'sex', 'sexo', 'gender-identity', 'genderidentity',
      'identidade-genero', 'identidadegenero', 'gender-select', 'genderselect',
      'your-gender', 'yourgender', 'candidate-gender', 'candidategender'
    ],

    // Cargo / Posição
    cargo: [
      'position', 'cargo', 'job-title', 'jobtitle', 'job_title', 'title', 'role',
      'current-title', 'currenttitle', 'current_title', 'current-position', 'currentposition',
      'desired-position', 'desiredposition', 'desired_position', 'current-role', 'currentrole',
      'occupation', 'ocupacao', 'ocupação', 'funcao', 'função', 'puesto', 'titulo',
      'professional-title', 'professionaltitle', 'headline', 'cargo-atual', 'cargoatual',
      'cargo-desejado', 'cargodesejado', 'vaga', 'position-applied', 'positionapplied'
    ],

    // Empresa Atual
    empresa: [
      'company', 'empresa', 'employer', 'empregador', 'current-company', 'currentcompany',
      'current_company', 'current-employer', 'currentemployer', 'organization', 'organisation',
      'organizacao', 'organização', 'companyname', 'company-name', 'company_name',
      'employer-name', 'employername', 'workplace', 'empresa-atual', 'empresaatual',
      'empresa_atual', 'firma', 'instituicao', 'instituição'
    ],

    // Anos de Experiência
    experiencia: [
      'experience', 'experiencia', 'experiência', 'years-experience', 'yearsexperience',
      'years_experience', 'years-of-experience', 'yearsofexperience', 'anos-experiencia',
      'anosexperiencia', 'anos_experiencia', 'work-experience', 'workexperience',
      'total-experience', 'totalexperience', 'exp-years', 'expyears',
      'experience-years', 'experienceyears', 'tiempo-experiencia'
    ],

    // Escolaridade / Educação
    escolaridade: [
      'education', 'escolaridade', 'educacao', 'educação', 'degree', 'grau',
      'education-level', 'educationlevel', 'education_level', 'nivel-escolaridade',
      'nivelescolaridade', 'nivel_escolaridade', 'academic-level', 'academiclevel',
      'formacao', 'formação', 'formacao-academica', 'formacaoacademica',
      'highest-education', 'highesteducation', 'highest-degree', 'highestdegree',
      'qualification', 'qualificacao', 'qualificação', 'nivel-educacao', 'niveleducacao',
      'escolaridad', 'nivel-academico', 'nivelacademico'
    ],

    // Pretensão Salarial
    pretensaoSalarial: [
      'salary', 'salario', 'salário', 'salary-expectation', 'salaryexpectation',
      'salary_expectation', 'expected-salary', 'expectedsalary', 'expected_salary',
      'pretensao-salarial', 'pretensaosalarial', 'pretensao_salarial',
      'desired-salary', 'desiredsalary', 'desired_salary', 'compensation',
      'remuneracao', 'remuneração', 'pay', 'wage', 'salary-range', 'salaryrange',
      'aspiracion-salarial', 'aspiracionsalarial', 'expectativa-salarial',
      'expectativasalarial', 'current-salary', 'currentsalary'
    ],

    // Disponibilidade
    disponibilidade: [
      'availability', 'disponibilidade', 'available', 'disponivel', 'disponível',
      'start-date', 'startdate', 'start_date', 'available-date', 'availabledate',
      'available_date', 'when-start', 'whenstart', 'data-inicio', 'datainicio',
      'data_inicio', 'disponibilidad', 'notice-period', 'noticeperiod', 'notice_period',
      'earliest-start', 'earlieststart', 'inicio', 'start-availability',
      'startavailability', 'can-start', 'canstart', 'join-date', 'joindate'
    ]
  };

  // Mapeamento de valores para selects/radios de gênero
  const genderValueMap = {
    'Masculino': ['male', 'masculino', 'masc', 'm', 'hombre', 'homme', 'man'],
    'Feminino': ['female', 'feminino', 'fem', 'f', 'mujer', 'femme', 'woman'],
    'Outro': ['other', 'outro', 'otros', 'autre', 'non-binary', 'nonbinary', 'não-binário', 'nao-binario', 'nb'],
    'Prefiro não informar': ['prefer not to say', 'prefer-not-to-say', 'not specified', 'undisclosed', 'prefiro não informar', 'prefiro nao informar', 'nao informar', 'decline']
  };

  // Mapeamento de valores para selects de escolaridade
  const educationValueMap = {
    'Ensino Médio': ['high school', 'highschool', 'ensino medio', 'ensino médio', 'secondary', 'medio', 'high-school'],
    'Técnico': ['technical', 'tecnico', 'técnico', 'vocational', 'associate', 'technician', 'curso tecnico', 'curso técnico'],
    'Graduação': ['bachelor', 'bachelors', "bachelor's", 'undergraduate', 'graduacao', 'graduação', 'superior', 'ensino superior', 'degree', 'college', 'licenciatura', 'bacharelado'],
    'Pós-Graduação': ['postgraduate', 'pos-graduacao', 'pós-graduação', 'specialization', 'especializacao', 'especialização', 'mba', 'post-graduate', 'lato sensu'],
    'Mestrado': ['master', 'masters', "master's", 'mestrado', 'msc', 'ms', 'ma', 'stricto sensu'],
    'Doutorado': ['doctorate', 'doctoral', 'doutorado', 'phd', 'ph.d', 'doctor', 'dr']
  };

  // Função para encontrar a melhor opção em um <select> que corresponda ao valor do usuário
  function matchSelectOption(selectEl, userValue, valueMap) {
    if (!userValue) return false;

    const options = Array.from(selectEl.options);
    const userValueLower = userValue.toLowerCase().trim();

    // Tentativa 1: correspondência exata pelo value ou texto da option
    for (const option of options) {
      if (option.value === '' || option.disabled) continue;
      if (option.value.toLowerCase() === userValueLower || option.text.toLowerCase() === userValueLower) {
        selectEl.value = option.value;
        return true;
      }
    }

    // Tentativa 2: correspondência parcial (contém)
    for (const option of options) {
      if (option.value === '' || option.disabled) continue;
      const optVal = option.value.toLowerCase();
      const optText = option.text.toLowerCase();
      if (optVal.includes(userValueLower) || optText.includes(userValueLower) ||
          userValueLower.includes(optVal) || userValueLower.includes(optText)) {
        selectEl.value = option.value;
        return true;
      }
    }

    // Tentativa 3: usar o mapa de valores para encontrar correspondência
    if (valueMap) {
      const aliases = valueMap[userValue] || [];
      for (const option of options) {
        if (option.value === '' || option.disabled) continue;
        const optVal = option.value.toLowerCase();
        const optText = option.text.toLowerCase();
        for (const alias of aliases) {
          if (optVal.includes(alias) || optText.includes(alias) || alias.includes(optVal) || alias.includes(optText)) {
            selectEl.value = option.value;
            return true;
          }
        }
      }
    }

    return false;
  }

  // Função para selecionar um radio button que corresponda ao valor
  function matchRadio(radios, userValue, valueMap) {
    if (!userValue) return false;

    const userValueLower = userValue.toLowerCase().trim();

    // Correspondência direta pelo value
    for (const radio of radios) {
      if (radio.value.toLowerCase() === userValueLower) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }

    // Correspondência parcial pelo value ou label associada
    for (const radio of radios) {
      const radioVal = radio.value.toLowerCase();
      const label = document.querySelector(`label[for="${radio.id}"]`);
      const labelText = label ? label.textContent.toLowerCase().trim() : '';

      if (radioVal.includes(userValueLower) || userValueLower.includes(radioVal) ||
          labelText.includes(userValueLower) || userValueLower.includes(labelText)) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }

    // Usar mapa de valores
    if (valueMap) {
      const aliases = valueMap[userValue] || [];
      for (const radio of radios) {
        const radioVal = radio.value.toLowerCase();
        const label = document.querySelector(`label[for="${radio.id}"]`);
        const labelText = label ? label.textContent.toLowerCase().trim() : '';
        for (const alias of aliases) {
          if (radioVal.includes(alias) || alias.includes(radioVal) ||
              labelText.includes(alias) || alias.includes(labelText)) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
      }
    }

    return false;
  }

  // Determinar qual valueMap usar para um campo
  function getValueMap(dataKey) {
    if (dataKey === 'genero') return genderValueMap;
    if (dataKey === 'escolaridade') return educationValueMap;
    return null;
  }

  // Função auxiliar para dar feedback visual em um elemento
  function highlightField(el) {
    el.style.backgroundColor = '#e7f3ff';
    setTimeout(() => {
      el.style.backgroundColor = '';
    }, 2000);
  }

  // Função para preencher campos
  function fillForm() {
    let filledCount = 0;

    Object.keys(fieldMappings).forEach(dataKey => {
      const value = userData[dataKey];
      if (!value) return;

      const possibleNames = fieldMappings[dataKey];
      const valueMap = getValueMap(dataKey);

      possibleNames.forEach(fieldName => {
        // === TEXT / EMAIL / TEL / URL / DATE INPUTS e TEXTAREAS ===
        let inputs = findElements(fieldName, 'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), textarea');

        inputs.forEach(input => {
          if (input.value && input.value.trim() !== '') return;

          const inputType = input.type.toLowerCase();
          if (inputType === 'text' || inputType === 'email' || inputType === 'tel' ||
              inputType === 'url' || inputType === 'date' || inputType === 'number' ||
              input.tagName.toLowerCase() === 'textarea') {

            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            highlightField(input);
            filledCount++;
          }
        });

        // === SELECT DROPDOWNS ===
        let selects = findElements(fieldName, 'select');

        selects.forEach(select => {
          if (select.value && select.value.trim() !== '' && select.selectedIndex > 0) return;

          const matched = matchSelectOption(select, value, valueMap);
          if (matched) {
            select.dispatchEvent(new Event('change', { bubbles: true }));
            highlightField(select);
            filledCount++;
          }
        });

        // === RADIO BUTTONS ===
        let radios = findElements(fieldName, 'input[type="radio"]');

        if (radios.length > 0) {
          // Agrupar radios pelo name attribute
          const radioGroups = {};
          radios.forEach(radio => {
            const groupName = radio.name || radio.id;
            if (!radioGroups[groupName]) radioGroups[groupName] = [];
            radioGroups[groupName].push(radio);
          });

          Object.values(radioGroups).forEach(group => {
            const alreadyChecked = group.some(r => r.checked);
            if (alreadyChecked) return;

            if (matchRadio(group, value, valueMap)) {
              filledCount++;
            }
          });
        }

        // === CHECKBOXES (para campos booleanos como "aceito termos") ===
        // Checkboxes são preenchidos apenas quando o valor salvo é explicitamente "true"/"sim"
        let checkboxes = findElements(fieldName, 'input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
          if (checkbox.checked) return;
          const valueLower = value.toLowerCase().trim();
          if (valueLower === 'true' || valueLower === 'sim' || valueLower === 'yes' || valueLower === '1') {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            highlightField(checkbox);
            filledCount++;
          }
        });
      });
    });

    if (filledCount > 0) {
      showNotification(`${filledCount} campos preenchidos automaticamente!`);
    }
  }

  // Função genérica para encontrar elementos por diferentes atributos
  function findElements(fieldName, selector) {
    let elements = [];

    // Por name
    let found = document.querySelectorAll(`${selector}[name*="${fieldName}" i]`);
    if (found.length > 0) { elements.push(...found); return elements; }

    // Por id
    found = document.querySelectorAll(`${selector}[id*="${fieldName}" i]`);
    if (found.length > 0) { elements.push(...found); return elements; }

    // Por placeholder
    found = document.querySelectorAll(`${selector}[placeholder*="${fieldName}" i]`);
    if (found.length > 0) { elements.push(...found); return elements; }

    // Por aria-label
    found = document.querySelectorAll(`${selector}[aria-label*="${fieldName}" i]`);
    if (found.length > 0) { elements.push(...found); return elements; }

    // Por data-field / data-name / data-testid
    found = document.querySelectorAll(`${selector}[data-field*="${fieldName}" i], ${selector}[data-name*="${fieldName}" i], ${selector}[data-testid*="${fieldName}" i]`);
    if (found.length > 0) { elements.push(...found); return elements; }

    // Por label associada (for attribute)
    const labels = document.querySelectorAll('label');
    labels.forEach(label => {
      if (label.textContent.toLowerCase().includes(fieldName.toLowerCase())) {
        const forId = label.getAttribute('for');
        if (forId) {
          const el = document.getElementById(forId);
          if (el && el.matches(selector)) {
            elements.push(el);
          }
        }
        // Label envolvendo o input
        const nested = label.querySelector(selector);
        if (nested) {
          elements.push(nested);
        }
      }
    });

    return elements;
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
