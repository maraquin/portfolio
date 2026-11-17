/* ---------- thème clair / sombre ---------- */

const racine = document.documentElement;

function themeSauvegarde() {
    try {
        return localStorage.getItem("theme");
    } catch (e) {
        return null;
    }
}

function appliquerTheme(theme) {
    racine.setAttribute("data-theme", theme);
    const bouton = document.getElementById("theme-toggle");
    if (bouton) {
        const versSombre = theme === "light";
        bouton.textContent = versSombre ? "🌙" : "☀️";
        bouton.setAttribute("aria-label", versSombre ? "Passer au thème sombre" : "Passer au thème clair");
        bouton.setAttribute("title", versSombre ? "Thème sombre" : "Thème clair");
    }
}

// thème clair par défaut (le choix du visiteur est mémorisé)
appliquerTheme(themeSauvegarde() === "dark" ? "dark" : "light");

const boutonTheme = document.createElement("button");
boutonTheme.id = "theme-toggle";
boutonTheme.className = "theme-toggle";
boutonTheme.type = "button";
document.body.appendChild(boutonTheme);
appliquerTheme(racine.getAttribute("data-theme"));

const DUREE_TRANSITION = 700; // ms, un peu plus long que la transition CSS (0.6s)
let minuteurTheme;

boutonTheme.addEventListener("click", () => {
    const suivant = racine.getAttribute("data-theme") === "dark" ? "light" : "dark";

    // active la transition le temps de la bascule seulement
    const supporteProperty = window.CSS && typeof CSS.registerProperty === "function";
    const classe = supporteProperty ? "theme-fluide" : "theme-fluide-secours";
    clearTimeout(minuteurTheme);
    racine.classList.remove("theme-fluide", "theme-fluide-secours");
    void racine.offsetWidth; // force le navigateur à prendre en compte le retrait
    racine.classList.add(classe);
    minuteurTheme = setTimeout(() => racine.classList.remove(classe), DUREE_TRANSITION);

    appliquerTheme(suivant);
    try {
        localStorage.setItem("theme", suivant);
    } catch (e) {}
});


/* ---------- bouton retour en haut ---------- */

const retourHaut = document.getElementById("retour-haut");

if (retourHaut) {
    window.addEventListener("scroll", () => {
        retourHaut.classList.toggle("visible", window.scrollY > 4000);
    });
}


/* ---------- barre de progression ---------- */

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



/* ---------- apparition en fondu au scroll (gauche -> droite) ---------- */

const ELEMENTS_A_REVELER = [
    // page d'accueil
    ".apropos-photo",
    ".apropos-texte > *",
    ".contenu h2",
    ".projets-intro",
    ".etape",
    ".competences",
    ".logiciels",
    ".carte",
    "#contact .profil",
    "#contact .formulaire",
    // pages projet
    ".btn-retour",
    ".projet-entete > *",
    ".projet-visuel",
    ".projet-bloc",
    // pied de page
    "footer .footer > div",
    "footer > p"
];

const sansAnimation = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !sansAnimation) {
    const elements = document.querySelectorAll(ELEMENTS_A_REVELER.join(","));

    const observateur = new IntersectionObserver((entrees) => {
        const visibles = entrees.filter((e) => e.isIntersecting);

        // ordre d'apparition : ligne par ligne, puis de la gauche vers la droite
        visibles.sort((a, b) => {
            const ra = a.boundingClientRect;
            const rb = b.boundingClientRect;
            const ligneA = Math.round(ra.top / 60);
            const ligneB = Math.round(rb.top / 60);
            return ligneA - ligneB || ra.left - rb.left;
        });

        visibles.forEach((entree, rang) => {
            const el = entree.target;
            observateur.unobserve(el);
            el.style.setProperty("--reveal-delay", Math.min(rang * 120, 600) + "ms");
            el.classList.add("reveal-visible");

            // nettoyage une fois l'animation terminée
            el.addEventListener("animationend", (e) => {
                if (e.target !== el || e.animationName !== "apparition-gauche") return;
                el.classList.remove("reveal", "reveal-visible");
                el.style.removeProperty("--reveal-delay");
            });
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });

    elements.forEach((el) => {
        el.classList.add("reveal");
        observateur.observe(el);
    });
}