let toastTimer;

function showDiscountToast(text) {
  let toast = document.getElementById('discount-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'discount-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

document.querySelectorAll('.code-chip[data-code]').forEach((chip) => {
  chip.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const code = chip.dataset.code;
    const url = chip.dataset.url;
    navigator.clipboard?.writeText(code).catch(() => {});
    window.open(url, '_blank', 'noopener,noreferrer');
    const host = new URL(url).hostname.replace('www.', '');
    showDiscountToast(`Código "${code}" copiado — abriendo ${host}…`);
  });
});
