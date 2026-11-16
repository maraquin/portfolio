const retourHaut = document.getElementById("retour-haut");

if (retourHaut) {
    window.addEventListener("scroll", () => {
        retourHaut.classList.toggle("visible", window.scrollY > 4000);
    });
}

const barreProgression = document.getElementById("progression-barre");

function majProgression() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = total > 0 ? window.scrollY / total : 0;
    barreProgression.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
}

if (barreProgression) {
    window.addEventListener("scroll", majProgression);
    window.addEventListener("resize", majProgression);
    majProgression();
}