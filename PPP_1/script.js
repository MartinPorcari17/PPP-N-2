
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const resultBox = document.getElementById('formResult');
  
  form.addEventListener('submit', (e) => {
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();
    const consent = form.querySelector('[name="consent"]').checked;
    const phone = form.querySelector('[name="phone"]').value.trim();
    const service = form.querySelector('[name="service"]').value;

    const errors = [];
    if (name.length < 2) errors.push('El nombre debe tener al menos 2 caracteres.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('El email no es válido.');
    if (message.length < 10) errors.push('El mensaje debe tener al menos 10 caracteres.');
    if (!consent) errors.push('Debes aceptar los términos para continuar.');
    if (phone && !/^\+?\d{7,15}$/.test(phone)) errors.push('Teléfono inválido.');

    if (errors.length) {
      e.preventDefault();
      resultBox.innerHTML = '<div class="form-error"><strong>Errores:</strong><ul>' + errors.map(r => '<li>'+r+'</li>').join('') + '</ul></div>';
      resultBox.scrollIntoView({behavior: 'smooth'});
      return false;
    }
    resultBox.innerHTML = '<div class="form-info">Enviando... revisa tu servidor PHP.</div>';
    return true;
  });


  const calcForm = document.getElementById('estimatorForm');
  const calcResult = document.getElementById('estimatorResult');
  function calculateEstimate() {
    const hours = parseFloat(calcForm.querySelector('[name="hours"]').value) || 0;
    const rate = parseFloat(calcForm.querySelector('[name="rate"]').value) || 0;
    const complexity = parseFloat(calcForm.querySelector('[name="complexity"]').value) || 1;
    const discount = parseFloat(calcForm.querySelector('[name="discount"]').value) || 0;

    let subtotal = hours * rate * complexity;
    let total = subtotal * (1 - Math.min(Math.max(discount,0),100)/100);
    subtotal = Math.round(subtotal*100)/100;
    total = Math.round(total*100)/100;
    calcResult.innerHTML = `<div class="calc-box"><p>Subtotal: <strong>$${subtotal}</strong></p><p>Total: <strong>$${total}</strong></p></div>`;
    
    localStorage.setItem('mamcode_estimate', JSON.stringify({hours, rate, complexity, discount}));
  }

  calcForm.addEventListener('input', calculateEstimate);
  calcForm.addEventListener('submit', (e) => { e.preventDefault(); calculateEstimate(); });

  const saved = localStorage.getItem('mamcode_estimate');
  if (saved) {
    const obj = JSON.parse(saved);
    calcForm.querySelector('[name="hours"]').value = obj.hours || '';
    calcForm.querySelector('[name="rate"]').value = obj.rate || '';
    calcForm.querySelector('[name="complexity"]').value = obj.complexity || '1';
    calcForm.querySelector('[name="discount"]').value = obj.discount || '0';
    calculateEstimate();
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('ok') === '1') {
    resultBox.innerHTML = '<div class="form-success">Gracias — tu mensaje fue recibido.</div>';
  } else if (params.get('ok') === '0' && params.get('err')) {
    resultBox.innerHTML = '<div class="form-error">Error: ' + decodeURIComponent(params.get('err')) + '</div>';
  }
});
