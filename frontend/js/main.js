function loadModule(moduleName) {
  document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
  const activeMenu = Array.from(document.querySelectorAll('.sidebar ul li')).find(li => li.textContent.toLowerCase().includes(moduleName));
  if (activeMenu) activeMenu.classList.add('active');

  fetch(`js/modules/${moduleName}.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('content').innerHTML = html;
      const script = document.createElement('script');
      script.src = `js/modules/${moduleName}.js`;
      document.body.appendChild(script);
    });
}

// carrega dashboard ao iniciar
loadModule('dashboard');

