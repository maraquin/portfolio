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
        bouton.textContent = versSombre ? "⏾" : "☀";
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

const carteMoi = document.getElementById('flip-photo');
if (carteMoi) {
    const basculer = () => carteMoi.classList.toggle('retourne');
    carteMoi.addEventListener('click', basculer);
    carteMoi.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            basculer();
        }
    });
}

/* ==========================================================
   CURSEUR PERSONNALISÉ — curseur.js
   Rond jaune translucide qui suit la souris.
   Ne s'active que sur les appareils à pointeur précis (souris).
   ========================================================== */
   (function () {
    'use strict';

    // pas de curseur perso sur tactile / stylet sans survol
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var racine = document.documentElement;

    var curseur = document.createElement('div');
    curseur.className = 'curseur';
    curseur.setAttribute('aria-hidden', 'true');
    curseur.innerHTML = '<div class="curseur-rond"></div>';
    document.body.appendChild(curseur);

    racine.classList.add('curseur-actif');

    // champs de saisie texte
    var CHAMP_TEXTE = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"])' +
                      ':not([type="submit"]):not([type="button"]), textarea';

    var cibleX = 0, cibleY = 0;   // position réelle de la souris
    var x = 0, y = 0;             // position affichée (lissée)
    var enMarche = false;

    function boucle() {
        // léger retard pour un mouvement fluide
        x += (cibleX - x) * 0.28;
        y += (cibleY - y) * 0.28;
        curseur.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';

        if (Math.abs(cibleX - x) > 0.1 || Math.abs(cibleY - y) > 0.1) {
            requestAnimationFrame(boucle);
        } else {
            enMarche = false;
        }
    }

    document.addEventListener('mousemove', function (e) {
        cibleX = e.clientX;
        cibleY = e.clientY;

        // première apparition : on se place directement, sans glisser depuis (0,0)
        if (!curseur.classList.contains('visible')) {
            x = cibleX;
            y = cibleY;
            curseur.classList.add('visible');
        }

        var el = e.target instanceof Element ? e.target : null;
        curseur.classList.toggle('texte', !!(el && el.closest(CHAMP_TEXTE)));

        if (!enMarche) {
            enMarche = true;
            requestAnimationFrame(boucle);
        }
    }, { passive: true });

    document.addEventListener('mousedown', function () { curseur.classList.add('clic'); });
    document.addEventListener('mouseup',   function () { curseur.classList.remove('clic'); });

    // la souris quitte la fenêtre / y revient
    document.documentElement.addEventListener('mouseleave', function () {
        curseur.classList.remove('visible');
    });
    document.documentElement.addEventListener('mouseenter', function () {
        curseur.classList.add('visible');
    });
})();


/* ==========================================================
   MODE DYSLEXIE — dyslexie.js
   Bouton "Aa" qui active une police lisible (Verdana) et des espacements aérés.
   Le choix est mémorisé dans le navigateur.
   ========================================================== */
   (function () {
    'use strict';

    var racine = document.documentElement;
    var CLE = 'dyslexie';

    function lire() {
        try { return localStorage.getItem(CLE) === 'on'; } catch (e) { return false; }
    }
    function ecrire(actif) {
        try { localStorage.setItem(CLE, actif ? 'on' : 'off'); } catch (e) {}
    }

    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'dyslexie-toggle';
    bouton.textContent = 'Aa';
    bouton.title = 'Police adaptée à la dyslexie';

    function appliquer(actif) {
        racine.classList.toggle('dyslexie', actif);
        bouton.setAttribute('aria-pressed', actif ? 'true' : 'false');
        bouton.setAttribute('aria-label',
            actif ? 'Désactiver la police adaptée à la dyslexie'
                  : 'Activer la police adaptée à la dyslexie');
    }

    bouton.addEventListener('click', function () {
        var actif = !racine.classList.contains('dyslexie');
        appliquer(actif);
        ecrire(actif);
    });

    document.body.appendChild(bouton);
    appliquer(lire());
})();

/* ==========================================================
   MENU BURGER — menu.js
   Ouvre / ferme le menu sur téléphone.
   - se ferme avec Échap, un clic ailleurs, un clic sur un lien,
     ou quand le focus clavier sort du menu
   - s'adapte si la fenêtre est agrandie (tablette, rotation)
   ========================================================== */
   (function () {
    'use strict';

    var header = document.querySelector('header');
    var bouton = document.querySelector('.burger');
    var panneau = document.getElementById('menu-principal');
    if (!header || !bouton || !panneau) return;

    var mobile = window.matchMedia('(max-width: 640px)');

    function estOuvert() {
        return header.classList.contains('menu-ouvert');
    }

    function definir(ouvert) {
        header.classList.toggle('menu-ouvert', ouvert);
        bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
        bouton.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    }

    bouton.addEventListener('click', function () {
        definir(!estOuvert());
    });

    // clic sur un lien du menu : on referme (la page défile vers la section)
    panneau.addEventListener('click', function (e) {
        if (e.target.closest('a')) definir(false);
    });

    // clic ou tap en dehors du menu
    document.addEventListener('click', function (e) {
        if (estOuvert() && !header.contains(e.target)) definir(false);
    });

    // touche Échap : on referme et on rend le focus au bouton
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && estOuvert()) {
            definir(false);
            bouton.focus();
        }
    });

    // le focus clavier quitte le menu : on referme
    header.addEventListener('focusout', function (e) {
        if (estOuvert() && e.relatedTarget && !header.contains(e.relatedTarget)) {
            definir(false);
        }
    });

    // passage en grand écran : on remet tout à zéro
    function surChangement() {
        if (!mobile.matches) definir(false);
    }
    if (mobile.addEventListener) mobile.addEventListener('change', surChangement);
    else if (mobile.addListener) mobile.addListener(surChangement);
})();




/* ==========================================================
   PROJETDEX
   - Se construit à partir des cartes .carte de la section #projets
   - Un projet est "visité" dès qu'on clique dessus (carte ou projetdex)
   - La progression est gardée dans localStorage
   - Si moins de TOTAL projets existent, les cases manquantes
     s'affichent comme "Bientôt" (le 8e projet n'est pas encore là)
   ========================================================== */
   (function () {
    "use strict";

    var TOTAL = 8;
    var CLE = "projetdex-visites";

    var bouton = document.getElementById("projetdex-ouvrir");
    var panneau = document.getElementById("projetdex");
    var grille = document.getElementById("projetdex-grille");
    var compteur = document.getElementById("projetdex-compteur");
    var statut = document.getElementById("projetdex-statut");
    var fermer = document.getElementById("projetdex-fermer");
    var cartes = document.querySelector("#projets .cartes");

    if (!bouton || !panneau || !grille || !compteur || !statut || !fermer || !cartes) return;

    /* --- données : les projets sont lus directement dans les cartes --- */
    function lireProjets() {
        return Array.prototype.map.call(cartes.querySelectorAll(".carte"), function (a) {
            var titre = a.querySelector("h3");
            var image = a.querySelector("img");
            return {
                href: a.getAttribute("href"),
                nom: titre ? titre.textContent.trim() : "Projet",
                image: image ? image.getAttribute("src") : ""
            };
        });
    }

    /* --- sauvegarde (avec repli en mémoire si localStorage est bloqué) --- */
    var visites = lire();

    function lire() {
        try {
            var brut = JSON.parse(localStorage.getItem(CLE));
            return Array.isArray(brut) ? brut : [];
        } catch (e) {
            return visites || [];
        }
    }

    function sauver() {
        try {
            localStorage.setItem(CLE, JSON.stringify(visites));
        } catch (e) { /* mode privé : on garde seulement la mémoire */ }
    }

    function marquer(href) {
        if (!href || visites.indexOf(href) !== -1) return;
        visites.push(href);
        sauver();
        /* rendu différé : on ne reconstruit pas le lien pendant le clic qui l'ouvre */
        setTimeout(rendu, 0);
    }

    /* --- construction d'un élément --- */
    function el(tag, classe, texte) {
        var n = document.createElement(tag);
        if (classe) n.className = classe;
        if (texte) n.textContent = texte;
        return n;
    }

    /* --- affichage --- */
    var etaitComplet = false;

    function rendu() {
        var projets = lireProjets();
        var total = Math.max(TOTAL, projets.length);
        var vus = projets.filter(function (p) { return visites.indexOf(p.href) !== -1; }).length;
        var complet = projets.length >= total && vus >= total;

        grille.textContent = "";

        projets.forEach(function (p) {
            var visite = visites.indexOf(p.href) !== -1;
            var li = el("li", "projetdex-case " + (visite ? "est-visite" : "est-verrouille"));
            var a = el("a");
            a.href = p.href;
            a.setAttribute("aria-label", p.nom + (visite ? ", projet visité" : ", projet pas encore visité"));

            var rond = el("span", "projetdex-rond");
            if (p.image) {
                var img = el("img");
                img.src = p.image;
                img.alt = "";
                img.loading = "lazy";
                rond.appendChild(img);
            }
            if (visite) {
                var coche = el("span", "projetdex-coche", "✓");
                coche.setAttribute("aria-hidden", "true");
                rond.appendChild(coche);
            } else {
                var inconnu = el("span", "projetdex-inconnu", "?");
                inconnu.setAttribute("aria-hidden", "true");
                rond.appendChild(inconnu);
            }

            a.appendChild(rond);
            a.appendChild(el("span", "projetdex-nom", visite ? p.nom : "???"));
            li.appendChild(a);
            grille.appendChild(li);
        });

        /* cases "à venir" jusqu'à atteindre TOTAL */
        for (var i = projets.length; i < total; i++) {
            var vide = el("li", "projetdex-case est-bientot");
            var rondVide = el("span", "projetdex-rond");
            var point = el("span", "projetdex-inconnu", "?");
            point.setAttribute("aria-hidden", "true");
            rondVide.appendChild(point);
            vide.appendChild(rondVide);
            vide.appendChild(el("span", "projetdex-nom", "Bientôt"));
            grille.appendChild(vide);
        }

        /* compteur : texte visible + version pour lecteurs d'écran */
        compteur.textContent = "";
        var visible = el("span", "", vus + " / " + total);
        visible.setAttribute("aria-hidden", "true");
        compteur.appendChild(visible);
        compteur.appendChild(el("span", "sr-only",
            vus + (vus > 1 ? " projets visités" : " projet visité") + " sur " + total));
        compteur.classList.toggle("est-complet", complet);

        /* message de fin (zone "status" : annoncé une seule fois) */
        if (complet && !etaitComplet) {
            statut.textContent = "";
            var bravo = el("p", "projetdex-bravo");
            var fete = el("span", "", "🎉 ");
            fete.setAttribute("aria-hidden", "true");
            bravo.appendChild(fete);
            bravo.appendChild(document.createTextNode("Bravo, vous avez vu tous mes projets !"));
            statut.appendChild(bravo);
        } else if (!complet) {
            statut.textContent = "";
        }
        etaitComplet = complet;
    }

    /* --- ouverture / fermeture --- */
    function ouvrir() {
        panneau.hidden = false;
        bouton.setAttribute("aria-expanded", "true");
        panneau.scrollIntoView({ block: "start" });
    }

    function fermerPanneau() {
        panneau.hidden = true;
        bouton.setAttribute("aria-expanded", "false");
        bouton.focus();
    }

    bouton.addEventListener("click", function () {
        if (panneau.hidden) ouvrir(); else fermerPanneau();
    });

    fermer.addEventListener("click", fermerPanneau);

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !panneau.hidden) fermerPanneau();
    });

    /* --- suivi des visites : clic gauche, clic molette, Entrée au clavier --- */
    function suivre(e) {
        var lien = e.target.closest ? e.target.closest("a[href]") : null;
        if (lien && (lien.classList.contains("carte") || lien.closest("#projetdex"))) {
            marquer(lien.getAttribute("href"));
        }
    }

    cartes.addEventListener("click", suivre);
    cartes.addEventListener("auxclick", suivre);
    grille.addEventListener("click", suivre);
    grille.addEventListener("auxclick", suivre);

    /* retour arrière du navigateur : on relit la sauvegarde */
    window.addEventListener("pageshow", function () {
        visites = lire();
        rendu();
    });
    window.addEventListener("storage", function (e) {
        if (e.key === CLE) {
            visites = lire();
            rendu();
        }
    });

    rendu();
})();