/* ============================================================
   2) LOGIQUE DE L'APPLICATION
   Organisation en 4 blocs :
     a) Persistance (lecture/écriture dans localStorage)
     b) État en mémoire (le tableau `tasks`)
     c) Rendu (fabrique le DOM à partir de l'état)
     d) Événements (relient les actions de l'utilisateur à l'état)
   ============================================================ */

// Clé utilisée dans localStorage. La préfixer évite les collisions
// avec d'autres scripts qui utiliseraient aussi localStorage.
const STORAGE_KEY = "pense-bete:tasks";

/**
 * a) PERSISTANCE
 * localStorage ne stocke que des chaînes de caractères : on doit donc
 * sérialiser/désérialiser en JSON. On entoure les accès de try/catch
 * car localStorage peut être indisponible (navigation privée, quota
 * dépassé, restrictions du navigateur) : dans ce cas, l'app continue
 * de fonctionner pour la session en cours, simplement sans persistance.
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Impossible de lire les tâches sauvegardées :", err);
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.warn("Impossible d'enregistrer les tâches :", err);
  }
}

/**
 * b) ÉTAT EN MÉMOIRE
 * `tasks` est la source de vérité pendant que la page est ouverte.
 * Chaque tâche est un objet simple : { id, text, done }.
 * On la recharge une seule fois au démarrage depuis localStorage.
 */
let tasks = loadTasks();
let currentFilter = "all"; // "all" | "active" | "done"

// Génère un identifiant unique pour chaque tâche (avec repli si
// crypto.randomUUID n'est pas disponible sur d'anciens navigateurs).
function makeId() {
  return (crypto.randomUUID && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addTask(text) {
  tasks.push({ id: makeId(), text: text.trim(), done: false });
  saveTasks(tasks);
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
  saveTasks(tasks);
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks(tasks);
  render();
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.done);
  saveTasks(tasks);
  render();
}

/**
 * c) RENDU
 * On reconstruit la liste affichée à chaque changement d'état.
 * Pour une to-do list de cette taille, régénérer le DOM à chaque
 * fois est largement assez rapide et garde le code simple — pas
 * besoin d'un diff virtuel ici.
 *
 * Important : le texte de la tâche est inséré via `textContent`
 * (jamais via innerHTML), ce qui empêche tout code HTML tapé par
 * l'utilisateur d'être interprété par le navigateur.
 */
function getFilteredTasks() {
  if (currentFilter === "active") return tasks.filter((t) => !t.done);
  if (currentFilter === "done") return tasks.filter((t) => t.done);
  return tasks;
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item" + (task.done ? " done" : "");
  li.dataset.id = task.id;

  li.innerHTML = `
    <span class="task-checkbox">
      <input type="checkbox" id="check-${task.id}" ${task.done ? "checked" : ""} aria-label="Marquer comme terminée">
      <span class="dot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
      </span>
    </span>
    <span class="task-text"></span>
    <button class="btn-delete" type="button" aria-label="Supprimer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-.9 13a1 1 0 01-1 .9H8.9a1 1 0 01-1-.9L7 7"/></svg>
    </button>
  `;

  // Texte inséré séparément et en toute sécurité via textContent.
  li.querySelector(".task-text").textContent = task.text;

  li.querySelector('input[type="checkbox"]').addEventListener("change", () => toggleTask(task.id));
  li.querySelector(".btn-delete").addEventListener("click", () => {
    // Petite animation de sortie avant de retirer réellement la tâche.
    li.classList.add("leaving");
    li.addEventListener("animationend", () => deleteTask(task.id), { once: true });
  });

  return li;
}

function render() {
  const list = document.getElementById("task-list");
  const visible = getFilteredTasks();

  list.replaceChildren(...visible.map(createTaskElement));

  // Compteurs et état vide.
  const remaining = tasks.filter((t) => !t.done).length;
  document.getElementById("counter").textContent = tasks.length;
  document.getElementById("remaining-text").textContent =
    `${remaining} tâche${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}`;

  const emptyState = document.getElementById("empty-state");
  const emptyMessage = document.getElementById("empty-message");
  if (visible.length === 0) {
    emptyMessage.textContent =
      tasks.length === 0
        ? "Rien pour l'instant. Ajoutez votre première tâche ci-dessus."
        : "Aucune tâche dans ce filtre.";
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  document.getElementById("clear-done").disabled = tasks.every((t) => !t.done);
}

/**
 * d) ÉVÉNEMENTS
 * Relie les interactions de l'utilisateur (soumission du formulaire,
 * clic sur un filtre, clic sur "Effacer les terminées") aux fonctions
 * d'état ci-dessus.
 */
const form = document.getElementById("add-form");
const input = document.getElementById("task-input");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    // Petit retour visuel si l'utilisateur valide un champ vide.
    input.classList.remove("shake");
    // Forcer un reflow pour pouvoir rejouer l'animation.
    void input.offsetWidth;
    input.classList.add("shake");
    input.focus();
    return;
  }

  addTask(text);
  input.value = "";
  input.focus();
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach((b) =>
      b.setAttribute("aria-selected", String(b === btn))
    );
    render();
  });
});

document.getElementById("clear-done").addEventListener("click", clearCompleted);

// Premier rendu, avec les tâches éventuellement déjà sauvegardées.
render();
