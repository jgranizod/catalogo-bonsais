// 🧭 Navegación entre secciones
window.mostrarSeccion = function(seccionId) {
  // Ocultar todas las secciones
  document.querySelectorAll('.seccion').forEach(seccion => {
    seccion.classList.remove('activa');
  });
  
  // Mostrar la sección seleccionada
  document.getElementById(seccionId).classList.add('activa');
  
  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 📧 Enviar mensaje de contacto
window.enviarMensaje = function(event) {
  event.preventDefault();
  
  const form = event.target;
  const nombre = form.querySelector('input[type="text"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const mensaje = form.querySelector('textarea').value;
  
  // Aquí puedes integrar con un servicio de email o backend
  alert(`✅ Mensaje enviado!\n\nNombre: ${nombre}\nEmail: ${email}\n\nTe contactaremos pronto.`);
  
  // Limpiar formulario
  form.reset();
};
