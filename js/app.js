// Local storage key
const STORAGE_KEY = "finance_dashboard_transactions_v1";

// State
let transactions = [];
let activeFilter = "all"; // 'all' | 'income' | 'expense'

// DOM elements
const balanceEl = document.getElementById("balanceValue");
const incomeEl = document.getElementById("incomeValue");
const expenseEl = document.getElementById("expenseValue");
const tbodyEl = document.getElementById("txTableBody");
const emptyStateEl = document.getElementById("emptyState");
const formEl = document.getElementById("txForm");
const clearAllBtn = document.getElementById("clearAllBtn");
const filterButtons = document.querySelectorAll(".menu-item");

// --- Helpers ---

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(amount) {
  return "$" + Number(amount).toFixed(2);
}

function getTodayDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// --- Render functions ---

function renderSummary() {
  let income = 0;
  let expense = 0;

  for (const tx of transactions) {
    if (tx.type === "income") {
      income += tx.amount;
    } else {
      expense += tx.amount;
    }
  }

  const balance = income - expense;

  balanceEl.textContent = formatCurrency(balance);
  incomeEl.textContent = formatCurrency(income);
  expenseEl.textContent = formatCurrency(expense);
}

function renderTable() {
  tbodyEl.innerHTML = "";

  const filtered = transactions.filter((tx) => {
    if (activeFilter === "all") return true;
    return tx.type === activeFilter;
  });

  if (filtered.length === 0) {
    emptyStateEl.style.display = "block";
  } else {
    emptyStateEl.style.display = "none";
  }

  filtered
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((tx) => {
      const tr = document.createElement("tr");

      const dateTd = document.createElement("td");
      dateTd.textContent = tx.date;

      const typeTd = document.createElement("td");
      const badge = document.createElement("span");
      badge.textContent = tx.type === "income" ? "Income" : "Expense";
      badge.className =
        tx.type === "income" ? "badge-income" : "badge-expense";
      typeTd.appendChild(badge);

      const catTd = document.createElement("td");
      catTd.textContent = tx.category || "-";

      const descTd = document.createElement("td");
      descTd.textContent = tx.description || "-";

      const amtTd = document.createElement("td");
      amtTd.className = "right";
      amtTd.textContent =
        (tx.type === "expense" ? "-" : "+") + formatCurrency(tx.amount);

      const actionTd = document.createElement("td");
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.innerHTML = "×";
      delBtn.onclick = () => deleteTransaction(tx.id);
      actionTd.appendChild(delBtn);

      tr.appendChild(dateTd);
      tr.appendChild(typeTd);
      tr.appendChild(catTd);
      tr.appendChild(descTd);
      tr.appendChild(amtTd);
      tr.appendChild(actionTd);

      tbodyEl.appendChild(tr);
    });
}

function renderAll() {
  renderSummary();
  renderTable();
}

// --- CRUD ---

function addTransaction({ type, amount, category, description }) {
  const tx = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    type,
    amount: Number(amount),
    category: category.trim(),
    description: description.trim(),
    date: getTodayDate(),
  };

  transactions.push(tx);
  saveToStorage();
  renderAll();
}

function deleteTransaction(id) {
  transactions = transactions.filter((tx) => tx.id !== id);
  saveToStorage();
  renderAll();
}

// --- Event handlers ---

formEl.addEventListener("submit", (e) => {
  e.preventDefault();

  const type = document.getElementById("txType").value;
  const amount = parseFloat(document.getElementById("txAmount").value || "0");
  const category = document.getElementById("txCategory").value;
  const description = document.getElementById("txDesc").value;

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount greater than 0.");
    return;
  }

  addTransaction({ type, amount, category, description });

  formEl.reset();
});

clearAllBtn.addEventListener("click", () => {
  if (!transactions.length) return;
  const ok = confirm("Clear all transactions? This cannot be undone.");
  if (!ok) return;

  transactions = [];
  saveToStorage();
  renderAll();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.getAttribute("data-filter");
    renderAll();
  });
});

// --- Init ---

(function init() {
  transactions = loadFromStorage();
  renderAll();
})();
