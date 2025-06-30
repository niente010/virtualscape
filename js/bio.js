// Array di tutte le identità disponibili
const allIdentities = [
  { text: ' Living Being', font: 'font-myrtillepixel' },
  { text: ' noisemaker', font: 'font-insolente' },
  { text: ' visual designer', font: 'font-karrik' },
  { text: ' biodesigner', font: 'font-fungal', style: 'font-size: 1.5em;' },
  { text: ' circuit bender', font: 'font-xbandrough' },
  { text: ' ELECTRONICS FREAK', font: 'font-petme' },
  { text: ' multimedia artist (???)', font: 'font-gensco' },
  { text: ' CREATIVE/CRITICAL TECHNOLOGIST', font: 'font-punknova' },
  { text: ' EDUCATOR ', font: 'font-apostlexiii' },
  { text: ' Researcher', font: 'font-fsslantedcursive' },
];

document.addEventListener('DOMContentLoaded', () => {
  const bioBlock = document.querySelector('.link-block[data-category="bio"]');
  const bioContainer = document.getElementById('bio-container');
  const squares = document.querySelectorAll('.identity-square');

  // Funzione per ottenere 3 identità casuali
  function getRandomIdentities() {
    const shuffled = [...allIdentities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  // Funzione per creare il selection menu
  function createSelectionMenu(currentIdentity, squareIndex) {
    const menu = document.createElement('select');
    menu.style.position = 'absolute';
    menu.style.zIndex = '1000';
    menu.style.backgroundColor = 'var(--main-color)';
    menu.style.color = 'var(--main-color)';
    menu.style.border = '1px solid var(--main-color)';
    menu.style.padding = '2px';
    menu.style.fontSize = '0.6em';
    menu.style.fontFamily = 'Karrik';
    
    // Aggiungi tutte le opzioni
    allIdentities.forEach(identity => {
      const option = document.createElement('option');
      option.value = JSON.stringify(identity);
      option.textContent = identity.text;
      if (identity.text === currentIdentity.text) {
        option.selected = true;
      }
      menu.appendChild(option);
    });

    // Posiziona il menu SOPRA il quadrato
    const square = squares[squareIndex];
    const rect = square.getBoundingClientRect();
    menu.style.left = rect.left + window.scrollX + 'px';
    menu.style.top = (rect.top + window.scrollY - 30) + 'px'; // 30px sopra il quadrato

    // Accendi il quadrato
    square.classList.add('active');

    // Gestisci il cambio di selezione
    menu.addEventListener('change', (e) => {
      const selectedIdentity = JSON.parse(e.target.value);
      updateIdentityDisplay(squareIndex, selectedIdentity);
      document.body.removeChild(menu);
      square.classList.remove('active');
    });

    // Chiudi il menu se si clicca fuori
    document.addEventListener('mousedown', function closeMenu(e) {
      if (!menu.contains(e.target) && e.target !== square) {
        document.body.removeChild(menu);
        square.classList.remove('active');
        document.removeEventListener('mousedown', closeMenu);
      }
    });

    document.body.appendChild(menu);
    menu.focus();
  }

  // Funzione per aggiornare la visualizzazione dell'identità
  function updateIdentityDisplay(squareIndex, identity) {
    const identitySpans = document.querySelectorAll('.identity-span');
    if (identitySpans[squareIndex]) {
      const span = identitySpans[squareIndex];
      span.textContent = identity.text;
      span.className = `identity-span ${identity.font}`;
    }
  }

  // Gestisci il click sui quadrati per aprire il menu
  squares.forEach((square, index) => {
    square.addEventListener('click', () => {
      const identitySpans = document.querySelectorAll('.identity-span');
      const currentIdentity = {
        text: identitySpans[index].textContent,
        font: identitySpans[index].className.replace('identity-span ', '')
      };
      createSelectionMenu(currentIdentity, index);
    });
  });
});

// Funzione per ottenere 3 identità casuali
function getRandomIdentities() {
  const shuffled = [...allIdentities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// Funzione per popolare i select e gestire la selezione
export function initializeIdentitySelects() {
  const selects = document.querySelectorAll('.identity-select');
  const spans = document.querySelectorAll('.identity-span');
  // Prendi 3 identità random
  const randomIdentities = getRandomIdentities();
  selects.forEach((select, idx) => {
    // Svuota il select
    select.innerHTML = '';
    // Popola tutte le opzioni
    allIdentities.forEach(identity => {
      const option = document.createElement('option');
      option.value = identity.text;
      option.textContent = identity.text;
      option.setAttribute('data-font', identity.font);
      // Prova ad applicare il font-family (supporto limitato)
      option.style.fontFamily = identity.font.replace('font-', '').replace(/([A-Z])/g, ' $1').trim();
      select.appendChild(option);
    });
    // Seleziona random
    select.value = randomIdentities[idx].text;
    // Aggiorna lo span accanto
    spans[idx].textContent = randomIdentities[idx].text;
    spans[idx].className = `identity-span ${randomIdentities[idx].font}`;
    // Gestisci il cambio
    select.onchange = function() {
      const selected = allIdentities.find(i => i.text === select.value);
      spans[idx].textContent = selected.text;
      spans[idx].className = `identity-span ${selected.font}`;
      select.style.fontFamily = selected.font.replace('font-', '').replace(/([A-Z])/g, ' $1').trim();
      select.blur(); // Spegne il quadrato dopo la selezione
    };
  });
}

// Gestione della navigazione hash per bio
export function handleBioNavigation() {
  const bioBlock = document.querySelector('.link-block[data-category="bio"]');
  const bioContainer = document.getElementById('bio-container');
  
  if (window.location.hash === '#bio') {
    if (bioBlock) bioBlock.classList.add('active');
    if (bioContainer) {
      bioContainer.style.display = 'block';
      bioContainer.style.opacity = '1';
      bioContainer.style.pointerEvents = 'auto';
      document.body.classList.add('bio-page');
      // Reinizializza gli identity selects
      const selects = document.querySelectorAll('.identity-select');
      if (selects.length > 0) {
        initializeIdentitySelects();
      }
    }
  } else {
    if (bioBlock) bioBlock.classList.remove('active');
    if (bioContainer) {
      bioContainer.style.opacity = '0';
      bioContainer.style.pointerEvents = 'none';
      document.body.classList.remove('bio-page');
      // Nascondi dopo la transizione
      setTimeout(() => {
        if (bioContainer.style.opacity === '0') {
          bioContainer.style.display = 'none';
        }
      }, 300);
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const link = document.querySelector('.hover-image-link');
  const img = link ? link.querySelector('.hover-image') : null;

  if (link && img) {
    link.addEventListener('mousemove', function(e) {
      img.style.display = 'block';
      img.style.left = (e.clientX + 20) + 'px'; // 20px a destra del cursore
      img.style.top = (e.clientY - 20) + 'px';  // 20px sopra il cursore
    });
    link.addEventListener('mouseleave', function() {
      img.style.display = 'none';
    });
  }
});