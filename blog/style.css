/* ================================================================
   CAHIER DE BORD — mini blog CRUD en JavaScript natif
   ================================================================
   Ce fichier est volontiers commenté : l'objectif annoncé est de
   s'exercer à la gestion de données côté client (state + storage),
   pas seulement d'obtenir une app qui marche.

   Plan du script :
     1. Constantes & état en mémoire
     2. Accès au stockage (lire/écrire localStorage)
     3. Utilitaires (id, date, échappement HTML)
     4. Opérations CRUD sur les articles et les commentaires
     5. Rendu (état -> DOM)
     6. Écouteurs d'événements (délégation)
     7. Démarrage de l'application
   ================================================================ */

// ---------------------------------------------------------------
// 1. CONSTANTES & ÉTAT
// ---------------------------------------------------------------

// Clé de stockage versionnée : si un jour le format des données
// change, on peut passer à "v2" sans entrer en conflit avec
// d'anciennes données incompatibles déjà présentes chez l'utilisateur.
const CLE_STOCKAGE = "cahier-de-bord:articles:v1";

// "état" de l'application : une seule source de vérité en mémoire.
// Le rendu (render) est toujours une fonction de cet état : on ne
// modifie jamais le DOM "à la main" en dehors de render().
const etat = {
  articles: [],       // tableau d'articles, voir modèle en tête de fichier
  idEnEdition: null,  // id de l'article actuellement en mode édition (ou null)
};

const feedEl = document.getElementById("feed");
const statsEl = document.getElementById("stats");
const formNouvelArticle = document.getElementById("new-article-form");
const champErreur = document.getElementById("new-error");

// ---------------------------------------------------------------
// 2. STOCKAGE (localStorage)
// ---------------------------------------------------------------
// localStorage peut échouer (navigation privée, quota dépassé,
// stockage désactivé par l'utilisateur…). On isole donc tout accès
// dans ces deux fonctions, chacune protégée par un try/catch, pour
// que le reste du code n'ait jamais à s'en soucier.

function chargerArticles() {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (brut === null) return null; // rien d'enregistré pour l'instant
    const donnees = JSON.parse(brut);
    return Array.isArray(donnees) ? donnees : null;
  } catch (erreur) {
    console.warn("[Cahier de Bord] Lecture du stockage impossible :", erreur);
    return null;
  }
}

function sauvegarderArticles() {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat.articles));
  } catch (erreur) {
    console.warn("[Cahier de Bord] Écriture dans le stockage impossible :", erreur);
  }
}

// ---------------------------------------------------------------
// 3. UTILITAIRES
// ---------------------------------------------------------------

// Génère un identifiant suffisamment unique pour une app locale.
// crypto.randomUUID() est la voie moderne ; on garde un repli au
// cas où l'environnement d'exécution ne l'expose pas.
function genererId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function formaterDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (erreur) {
    return iso;
  }
}

// Échappe une chaîne avant de l'injecter dans du HTML.
// Principe : on confie le texte à .textContent (qui ne l'interprète
// jamais comme du HTML), puis on relit .innerHTML, qui contient
// alors la version échappée (< devient &lt;, etc.). Indispensable
// dès qu'on affiche du texte saisi par l'utilisateur avec
// innerHTML, sous peine d'injection de script (XSS).
function echapperHtml(texte) {
  const div = document.createElement("div");
  div.textContent = texte;
  return div.innerHTML;
}

function trouverArticle(id) {
  return etat.articles.find((a) => a.id === id);
}

// ---------------------------------------------------------------
// 4. OPÉRATIONS CRUD
// ---------------------------------------------------------------

function creerArticle(titre, contenu) {
  const maintenant = new Date().toISOString();
  etat.articles.push({
    id: genererId(),
    titre: titre.trim(),
    contenu: contenu.trim(),
    creeLe: maintenant,
    modifieLe: maintenant,
    commentaires: [],
  });
  sauvegarderArticles();
}

function modifierArticle(id, titre, contenu) {
  const article = trouverArticle(id);
  if (!article) return;
  article.titre = titre.trim();
  article.contenu = contenu.trim();
  article.modifieLe = new Date().toISOString();
  sauvegarderArticles();
}

function supprimerArticle(id) {
  etat.articles = etat.articles.filter((a) => a.id !== id);
  sauvegarderArticles();
}

function ajouterCommentaire(idArticle, texte) {
  const article = trouverArticle(idArticle);
  if (!article) return;
  article.commentaires.push({
    id: genererId(),
    texte: texte.trim(),
    creeLe: new Date().toISOString(),
  });
  sauvegarderArticles();
}

function supprimerCommentaire(idArticle, idCommentaire) {
  const article = trouverArticle(idArticle);
  if (!article) return;
  article.commentaires = article.commentaires.filter((c) => c.id !== idCommentaire);
  sauvegarderArticles();
}

// ---------------------------------------------------------------
// 5. RENDU — l'état devient du HTML
// ---------------------------------------------------------------
// On reconstruit tout le fil à chaque changement d'état plutôt que
// de "patcher" le DOM à la main : c'est plus simple à raisonner
// pour un exercice pédagogique, et largement assez rapide pour le
// volume de données d'un blog personnel.

function rendreCommentaire(idArticle, commentaire) {
  return `
    <li class="comment">
      <span>
        <span class="comment-text">${echapperHtml(commentaire.texte)}</span>
        <span class="comment-date mono">${formaterDate(commentaire.creeLe)}</span>
      </span>
      <button
        class="comment-delete"
        type="button"
        data-action="supprimer-commentaire"
        data-id-article="${idArticle}"
        data-id-commentaire="${commentaire.id}"
        aria-label="Supprimer ce commentaire"
      >✕</button>
    </li>`;
}

function rendreCommentaires(article) {
  const liste = article.commentaires
    .map((c) => rendreCommentaire(article.id, c))
    .join("");

  return `
    <div class="comments">
      <p class="comments-label">${article.commentaires.length} commentaire(s)</p>
      <ul class="comment-list">${liste}</ul>
      <form class="comment-form" data-form="nouveau-commentaire" data-id-article="${article.id}">
        <label class="sr-only" for="comment-input-${article.id}">Ajouter un commentaire</label>
        <input type="text" id="comment-input-${article.id}" placeholder="Ajouter un commentaire…" maxlength="300" />
        <button type="submit" class="btn btn-ghost btn-sm">Commenter</button>
      </form>
    </div>`;
}

function rendreArticleEnEdition(article) {
  return `
    <article class="article">
      <form class="edit-form" data-form="modifier-article" data-id-article="${article.id}">
        <div class="field">
          <label class="field-label" for="edit-title-${article.id}">Titre</label>
          <input type="text" id="edit-title-${article.id}" value="${echapperHtml(article.titre)}" maxlength="120" />
        </div>
        <div class="field">
          <label class="field-label" for="edit-content-${article.id}">Contenu</label>
          <textarea id="edit-content-${article.id}" rows="4">${echapperHtml(article.contenu)}</textarea>
        </div>
        <div class="edit-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-action="annuler-edition">Annuler</button>
          <button type="submit" class="btn btn-primary btn-sm">Enregistrer</button>
        </div>
      </form>
      ${rendreCommentaires(article)}
    </article>`;
}

function rendreArticleAffichage(article) {
  const modifie = article.modifieLe !== article.creeLe;
  return `
    <article class="article">
      <div class="article-head">
        <div>
          <h3 class="article-title">${echapperHtml(article.titre)}</h3>
          <span class="article-date mono">
            ${formaterDate(article.creeLe)}${modifie ? " · modifié " + formaterDate(article.modifieLe) : ""}
          </span>
        </div>
        <div class="article-actions">
          <button class="btn btn-ghost btn-sm" type="button" data-action="editer-article" data-id-article="${article.id}">Modifier</button>
          <button class="btn btn-danger btn-sm" type="button" data-action="supprimer-article" data-id-article="${article.id}">Supprimer</button>
        </div>
      </div>
      <p class="article-body">${echapperHtml(article.contenu)}</p>
      ${rendreCommentaires(article)}
    </article>`;
}

function rendre() {
  // Tri du plus récent au plus ancien, sans muter le tableau d'état
  // (on trie une copie avec .slice()).
  const articlesTries = etat.articles
    .slice()
    .sort((a, b) => new Date(b.creeLe) - new Date(a.creeLe));

  if (articlesTries.length === 0) {
    feedEl.innerHTML = `<p class="empty">Aucun article pour l'instant — écrivez le premier ci-dessus.</p>`;
  } else {
    feedEl.innerHTML = articlesTries
      .map((article) =>
        article.id === etat.idEnEdition
          ? rendreArticleEnEdition(article)
          : rendreArticleAffichage(article)
      )
      .join("");
  }

  const nbCommentaires = etat.articles.reduce((total, a) => total + a.commentaires.length, 0);
  statsEl.textContent = `${etat.articles.length} article(s) · ${nbCommentaires} commentaire(s)`;
}

// ---------------------------------------------------------------
// 6. ÉVÉNEMENTS — délégation sur les conteneurs parents
// ---------------------------------------------------------------
// Comme le fil d'articles est régénéré à chaque rendu, on n'attache
// pas d'écouteur individuel sur chaque bouton (ils seraient détruits
// à chaque rendu). On écoute plutôt les clics et les soumissions sur
// un ancêtre stable, puis on regarde quel élément a déclenché
// l'événement : c'est la délégation d'événements.

formNouvelArticle.addEventListener("submit", (e) => {
  e.preventDefault();
  const titre = document.getElementById("new-title").value;
  const contenu = document.getElementById("new-content").value;

  if (!titre.trim() || !contenu.trim()) {
    champErreur.textContent = "Titre et contenu sont obligatoires.";
    return;
  }
  champErreur.textContent = "";

  creerArticle(titre, contenu);
  formNouvelArticle.reset();
  rendre();
});

feedEl.addEventListener("submit", (e) => {
  const form = e.target;
  e.preventDefault();

  if (form.dataset.form === "modifier-article") {
    const idArticle = form.dataset.idArticle;
    const titre = document.getElementById(`edit-title-${idArticle}`).value;
    const contenu = document.getElementById(`edit-content-${idArticle}`).value;
    if (!titre.trim() || !contenu.trim()) return; // pas de sauvegarde vide
    modifierArticle(idArticle, titre, contenu);
    etat.idEnEdition = null;
    rendre();
    return;
  }

  if (form.dataset.form === "nouveau-commentaire") {
    const idArticle = form.dataset.idArticle;
    const champ = form.querySelector("input");
    if (!champ.value.trim()) return;
    ajouterCommentaire(idArticle, champ.value);
    rendre();
    return;
  }
});

feedEl.addEventListener("click", (e) => {
  const bouton = e.target.closest("[data-action]");
  if (!bouton) return;
  const action = bouton.dataset.action;

  if (action === "editer-article") {
    etat.idEnEdition = bouton.dataset.idArticle;
    rendre();
  } else if (action === "annuler-edition") {
    etat.idEnEdition = null;
    rendre();
  } else if (action === "supprimer-article") {
    const article = trouverArticle(bouton.dataset.idArticle);
    const nom = article ? `« ${article.titre} »` : "cet article";
    if (window.confirm(`Supprimer ${nom} ainsi que ses commentaires ?`)) {
      supprimerArticle(bouton.dataset.idArticle);
      rendre();
    }
  } else if (action === "supprimer-commentaire") {
    supprimerCommentaire(bouton.dataset.idArticle, bouton.dataset.idCommentaire);
    rendre();
  }
});

// ---------------------------------------------------------------
// 7. DÉMARRAGE
// ---------------------------------------------------------------
// Au premier lancement (rien en localStorage), on propose deux
// articles d'exemple pour que l'app ne s'ouvre pas sur une page
// vide — clairement identifiables comme des exemples, pas des
// données de l'utilisateur.

function creerJeuDExemple() {
  const ilYA = (jours) => new Date(Date.now() - jours * 86400000).toISOString();
  return [
    {
      id: genererId(),
      titre: "Bienvenue dans votre cahier de bord",
      contenu:
        "Ceci est un article d'exemple. Modifiez-le, supprimez-le, ou laissez-le ici le temps de vous familiariser avec l'app. Chaque article peut recevoir des commentaires juste en dessous.",
      creeLe: ilYA(2),
      modifieLe: ilYA(2),
      commentaires: [
        { id: genererId(), texte: "Exemple de commentaire — supprimez-le avec la croix.", creeLe: ilYA(1) },
      ],
    },
    {
      id: genererId(),
      titre: "Tout est sauvegardé localement",
      contenu:
        "Articles et commentaires sont stockés dans le localStorage de votre navigateur : ils survivent à un rafraîchissement de page, mais restent propres à cet appareil et à ce navigateur.",
      creeLe: ilYA(5),
      modifieLe: ilYA(5),
      commentaires: [],
    },
  ];
}

function demarrer() {
  const donneesSauvegardees = chargerArticles();
  etat.articles = donneesSauvegardees !== null ? donneesSauvegardees : creerJeuDExemple();
  if (donneesSauvegardees === null) {
    sauvegarderArticles(); // on persiste le jeu d'exemple dès le premier chargement
  }
  rendre();
}

demarrer();
