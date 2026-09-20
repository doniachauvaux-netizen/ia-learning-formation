// ════════════════════════════════════════════════════════════════════════════
// CALCULATRICE — script.js
// ════════════════════════════════════════════════════════════════════════════


// ── 1. ÉTAT DE LA CALCULATRICE ───────────────────────────────────────────────
// Un seul objet regroupe toutes les données nécessaires au fonctionnement.
const state = {
  current:  '0',        // Nombre actuellement affiché à l'écran
  previous: null,        // Premier opérande mémorisé (ex. "12" dans "12 + 3")
  operator: null,        // Opération en attente : '+', '−', '×' ou '÷'
  justCalc: false,       // Vrai juste après avoir appuyé sur '=' (pour repartir proprement)
  freshOperand: false    // Vrai juste après avoir cliqué sur un opérateur (pour repartir sur un NOUVEAU nombre)
};


// ── 2. RÉFÉRENCES AUX ÉLÉMENTS HTML ─────────────────────────────────────────
// On récupère les deux zones d'affichage une seule fois pour aller plus vite.
const mainEl = document.getElementById('main'); // Grand nombre
const exprEl = document.getElementById('expr'); // Petite ligne d'expression


// ── 3. MISE À JOUR DE L'ÉCRAN ────────────────────────────────────────────────
// Cette fonction est appelée après CHAQUE action pour rafraîchir l'affichage.
function render() {
  // toPrecision(10) évite les résultats parasites comme "0.30000000000000004"
  const num = parseFloat(state.current);
  const display = Number.isNaN(num)
    ? state.current  // Si ce n'est pas un nombre (ex. "Erreur"), on affiche tel quel
    : parseFloat(num.toPrecision(10)).toString();

  mainEl.textContent = display;

  // La petite ligne montre l'expression si une opération est en attente
  exprEl.textContent = (state.previous !== null && state.operator)
    ? `${state.previous} ${state.operator}`
    : '';
}


// ── 4. CALCUL ────────────────────────────────────────────────────────────────
// Reçoit deux nombres (en chaînes de caractères) et un opérateur.
// Renvoie le résultat sous forme de nombre.
function compute(a, b, op) {
  const x = parseFloat(a); // Convertit la chaîne "12" en nombre 12
  const y = parseFloat(b);

  if (op === '+') return x + y;
  if (op === '−') return x - y;
  if (op === '×') return x * y;
  if (op === '÷') {
    if (y === 0) return 'Erreur'; // On ne divise jamais par zéro !
    return x / y;
  }
}


// ── 5. GESTIONNAIRE PRINCIPAL ────────────────────────────────────────────────
// Reçoit l'action (ex. 'digit') et sa valeur optionnelle (ex. '7').
// Modifie l'état, puis appelle render() pour mettre à jour l'écran.
function handleAction(action, val) {

  // ── CAS 1 : UN CHIFFRE (0 à 9) ──────────────────────────────────────────
  if (action === 'digit') {
    if (state.justCalc) {
      // Après '=', on recommence une nouvelle saisie
      state.current  = val;
      state.previous = null;
      state.operator = null;
      state.justCalc = false;
    } else if (state.freshOperand) {
      // On vient de cliquer sur un opérateur : on efface l'ancien nombre
      // et on repart de zéro sur le nouveau (c'est ça qui corrige le bug du "896")
      state.current = val;
      state.freshOperand = false;
    } else if (state.current === '0') {
      state.current = val;          // On remplace le '0' initial (évite "07")
    } else {
      state.current += val;         // On colle le chiffre à la suite
    }
  }

  // ── CAS 2 : LA VIRGULE DÉCIMALE ─────────────────────────────────────────
  else if (action === 'decimal') {
    if (state.justCalc) {
      state.current  = '0,';        // Après '=', on repart sur "0,"
      state.justCalc = false;
      return render();
    }
    if (state.freshOperand) {
      // Même logique : nouveau nombre décimal après un opérateur
      state.current = '0,';
      state.freshOperand = false;
      return render();
    }
    // On refuse d'ajouter une 2e virgule si le nombre en a déjà une
    if (!state.current.includes(',')) {
      state.current += ',';
    }
  }

  // ── CAS 3 : UN OPÉRATEUR (÷ × − +) ─────────────────────────────────────
  else if (action === 'op') {
    // On convertit la virgule en point pour que parseFloat fonctionne
    const n = state.current.replace(',', '.');

    if (state.operator && !state.justCalc && !state.freshOperand) {
      // Si une opération était déjà en cours, on la termine d'abord
      // Exemple : "3 + 5 ×" → on calcule d'abord "3 + 5 = 8", puis on enregistre "×"
      const res = compute(state.previous, n, state.operator);
      state.previous = String(res);
      state.current  = String(res);
    } else {
      // Sinon on mémorise juste le nombre actuel comme premier opérande
      state.previous = n;
    }

    state.operator = val;           // On enregistre le nouvel opérateur
    state.justCalc = false;
    state.freshOperand = true;      // Le prochain chiffre doit repartir de zéro
    return render();
  }

  // ── CAS 4 : ÉGAL (=) ────────────────────────────────────────────────────
  else if (action === 'equals') {
    // Si aucune opération n'est en attente, il n'y a rien à calculer
    if (!state.operator || state.previous === null) return;

    const n = state.current.replace(',', '.');
    const res = compute(state.previous, n, state.operator);

    // On affiche l'expression complète dans la petite ligne (ex. "3 + 5 =")
    exprEl.textContent = `${state.previous} ${state.operator} ${n} =`;

    state.current  = String(res).replace('.', ','); // Point → virgule pour l'affichage
    state.previous = null;
    state.operator = null;
    state.justCalc = true;          // Signal : le prochain chiffre repart à zéro
    state.freshOperand = false;

    mainEl.textContent = state.current;
    return; // On gère l'affichage manuellement ici, pas besoin de render()
  }

  // ── CAS 5 : AC — RÉINITIALISATION TOTALE ────────────────────────────────
  else if (action === 'clear') {
    state.current  = '0';
    state.previous = null;
    state.operator = null;
    state.justCalc = false;
    state.freshOperand = false;
  }

  // ── CAS 6 : +/− — INVERSE LE SIGNE ─────────────────────────────────────
  else if (action === 'sign') {
    // Si le nombre commence par '-', on enlève le signe ; sinon on l'ajoute
    state.current = state.current.startsWith('-')
      ? state.current.slice(1)      // .slice(1) = tout sauf le 1er caractère
      : '-' + state.current;
  }

  // ── CAS 7 : % — POURCENTAGE ─────────────────────────────────────────────
  else if (action === 'percent') {
    const n = parseFloat(state.current.replace(',', '.'));
    // Divise par 100 : "50" → "0,5"
    state.current  = String(n / 100).replace('.', ',');
    state.justCalc = false;
  }

  render(); // Rafraîchit l'écran après chaque action
}


// ── 6. ÉCOUTE DES CLICS ──────────────────────────────────────────────────────
// Technique : on écoute UN seul clic sur le parent ".grid"
// plutôt que 19 écouteurs individuels sur chaque bouton.
// "e.target.closest('[data-action]')" remonte jusqu'au bouton cliqué.
document.querySelector('.grid').addEventListener('click', function(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return; // Clic en dehors d'un bouton → on ignore

  const action = btn.dataset.action; // Lit l'attribut data-action du bouton
  const val    = btn.dataset.val;    // Lit l'attribut data-val (peut être undefined)

  handleAction(action, val);
});


// ── 7. AFFICHAGE INITIAL ─────────────────────────────────────────────────────
// On appelle render() une première fois pour afficher "0" au chargement.
render();
