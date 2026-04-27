"use strict";

// ── Données UC ──────────────────────────────────────────────────────────────
// Ajouter des entrées ici pour étendre la liste. Un `opportunityId` vide ou
// absent déclenchera un message d'erreur explicite dans l'interface.

const UC_LIST = [
  { uc: "ESG Montpellier",        opportunityId: "006To00000PuAG1IAN" },
  { uc: "Esarc Montpellier",      opportunityId: "006To00000V93RUIAZ" },
  { uc: "Lisaa Montpellier",      opportunityId: "006To00000VBKpbIAH" },
  { uc: "ESG Sport Montpellier",  opportunityId: "006To00000VBMWRIA5" },
  { uc: "ESG Luxe Montpellier",   opportunityId: "006To00000VKsC5IAL" },
];

// ── Constante métier ─────────────────────────────────────────────────────────
const FIXED_CONTACT_ID = "0036N00000XpWXIQA3";

// ── Placeholders attendus dans l'URL ─────────────────────────────────────────
const PLACEHOLDER_CONTACT     = "{{ContactId}}";
const PLACEHOLDER_OPPORTUNITY = "{{OpportunityID}}";

// ── Références DOM ────────────────────────────────────────────────────────────
const urlInput     = document.getElementById("urlInput");
const ucSelect     = document.getElementById("ucSelect");
const generateBtn  = document.getElementById("generateBtn");
const resultSection = document.getElementById("resultSection");
const resultLink   = document.getElementById("resultLink");
const copyBtn      = document.getElementById("copyBtn");
const errorLog     = document.getElementById("errorLog");

// ── Initialisation du menu déroulant ─────────────────────────────────────────
UC_LIST.forEach((item, index) => {
  const opt = document.createElement("option");
  opt.value = index;
  opt.textContent = item.uc;
  ucSelect.appendChild(opt);
});

// ── Logique principale ────────────────────────────────────────────────────────
generateBtn.addEventListener("click", generate);

function generate() {
  const rawUrl  = urlInput.value.trim();
  const ucIndex = ucSelect.value;
  const errors  = [];

  // Masquer le résultat précédent
  resultSection.hidden = true;
  resultLink.href = "#";
  resultLink.textContent = "";

  // ── Validation des champs obligatoires ──
  if (!rawUrl) {
    errors.push("Le champ URL est vide. Veuillez coller une URL à tester.");
  }
  if (ucIndex === "") {
    errors.push("Aucune UC sélectionnée. Veuillez choisir une UC dans le menu déroulant.");
  }

  if (errors.length > 0) {
    renderErrors(errors);
    return;
  }

  const selectedUC = UC_LIST[parseInt(ucIndex, 10)];

  // ── Validation des placeholders dans l'URL ──
  const hasContactId     = rawUrl.includes(PLACEHOLDER_CONTACT);
  const hasOpportunityId = rawUrl.includes(PLACEHOLDER_OPPORTUNITY);

  if (!hasContactId) {
    errors.push(
      `Le placeholder ${PLACEHOLDER_CONTACT} est absent de l'URL. Vérifiez que l'URL contient bien ce paramètre.`
    );
  }
  if (!hasOpportunityId) {
    errors.push(
      `Le placeholder ${PLACEHOLDER_OPPORTUNITY} est absent de l'URL. Vérifiez que l'URL contient bien ce paramètre.`
    );
  }

  // ── Validation de l'Opportunity ID de l'UC ──
  if (!selectedUC.opportunityId) {
    errors.push(
      `Opportunity ID manquant pour cette UC : « ${selectedUC.uc} ». Le lien ne peut pas être généré.`
    );
  }

  if (errors.length > 0) {
    renderErrors(errors);
    return;
  }

  // ── Génération du lien final ──
  const finalUrl = rawUrl
    .replace(PLACEHOLDER_CONTACT,     FIXED_CONTACT_ID)
    .replace(PLACEHOLDER_OPPORTUNITY, selectedUC.opportunityId);

  renderErrors([]);
  showResult(finalUrl);
}

// ── Affichage du résultat ─────────────────────────────────────────────────────
function showResult(url) {
  resultLink.href        = url;
  resultLink.textContent = url;
  resultSection.hidden   = false;

  // Bouton copier
  copyBtn.textContent = "Copier le lien";
  copyBtn.onclick = () => {
    if (!navigator.clipboard) {
      // Fallback pour les navigateurs sans API Clipboard
      const tmp = document.createElement("textarea");
      tmp.value = url;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      flashCopyBtn();
      return;
    }
    navigator.clipboard.writeText(url).then(flashCopyBtn);
  };
}

function flashCopyBtn() {
  copyBtn.textContent = "Copié !";
  setTimeout(() => { copyBtn.textContent = "Copier le lien"; }, 2000);
}

// ── Affichage du journal d'erreurs ────────────────────────────────────────────
function renderErrors(errors) {
  if (errors.length === 0) {
    errorLog.innerHTML = '<p class="log-empty">Aucune erreur détectée.</p>';
    return;
  }
  const items = errors.map(e => `<li>${escapeHtml(e)}</li>`).join("");
  errorLog.innerHTML = `<ul class="error-list">${items}</ul>`;
}

// Protège contre toute valeur inattendue dans les messages affichés
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
