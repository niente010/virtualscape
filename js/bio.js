document.addEventListener('DOMContentLoaded', () => {
  const bioBlock = document.querySelector('.link-block[data-category="bio"]');
  const bioContainer = document.getElementById('bio-container');

  function showBio() {
    bioContainer.style.display = 'block';
    bioContainer.style.opacity = '1';
    bioContainer.style.pointerEvents = 'auto';
    document.body.classList.add('bio-page');
    window.location.hash = '#bio';
  }

  function hideBio() {
    bioContainer.style.opacity = '0';
    bioContainer.style.pointerEvents = 'none';
    document.body.classList.remove('bio-page');
    if (window.location.hash === '#bio') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    // Nascondi dopo la transizione
    setTimeout(() => {
      if (bioContainer.style.opacity === '0') {
        bioContainer.style.display = 'none';
      }
    }, 300);
  }

  if (bioBlock) {
    bioBlock.addEventListener('click', (e) => {
      e.preventDefault();
      if (bioContainer.style.opacity === '1') {
        hideBio();
      } else {
        showBio();
      }
    });
  }

  // Mostra la bio se l'hash è già #bio al caricamento
  if (window.location.hash === '#bio') {
    showBio();
  }

  // Sincronizza con cambi hash manuali
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#bio') {
      showBio();
    } else {
      hideBio();
    }
  });
});