(function () {
  const hojas = document.querySelectorAll(".hoja");
  const escena = document.getElementById("bonsai-escena");
  if (!escena || hojas.length === 0) return;

  hojas.forEach((hoja) => {
    let offsetX = 0;
    let offsetY = 0;
    let arrastrando = false;

    hoja.addEventListener("mousedown", (e) => {
      arrastrando = true;
      hoja.classList.add("arrastrando");
      const rect = hoja.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      hoja.style.position = "absolute";
      hoja.style.zIndex = "50";
    });

    document.addEventListener("mousemove", (e) => {
      if (!arrastrando) return;
      const escenaRect = escena.getBoundingClientRect();
      const x = e.clientX - escenaRect.left - offsetX;
      const y = e.clientY - escenaRect.top - offsetY;
      hoja.style.left = x + "px";
      hoja.style.top = y + "px";
    });

    document.addEventListener("mouseup", () => {
      if (!arrastrando) return;
      arrastrando = false;
      hoja.classList.remove("arrastrando");
      hoja.classList.add("caer");
      setTimeout(() => {
        hoja.classList.remove("caer");
        hoja.style.left = "";
        hoja.style.top = "";
        hoja.style.position = "";
        hoja.style.zIndex = "";
      }, 2000);
    });
  });
})();
