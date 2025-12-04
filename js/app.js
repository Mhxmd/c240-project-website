// Local Storage Key
const STORAGE_KEY = "finx_transactions";

// State
let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = "all";

// Elements
const txForm = document.getElementById("txForm");
const txTable = document.getElementById("txTableBody");
const emptyState = document.getElementById("emptyState");
const balanceValue = document.getElementById("balanceValue");
const incomeValue = document.getElementById("incomeValue");
const expenseValue = document.getElementById("expenseValue");
const clearAllBtn = document.getElementById("clearAllBtn");

// FILTER BUTTONS
document.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".menu-item").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        render();
    });
});

// Format Currency
const money = amt => "$" + Number(amt).toFixed(2);

// Save to Storage
function sync() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Add Transaction
txForm.addEventListener("submit", e => {
    e.preventDefault();

    const type = document.getElementById("txType").value;
    const amount = parseFloat(document.getElementById("txAmount").value);
    const category = document.getElementById("txCategory").value.trim() || "-";
    const desc = document.getElementById("txDesc").value.trim() || "-";

    if (!amount || amount <= 0) return alert("Enter a valid amount.");

    transactions.push({
        id: Date.now(),
        type,
        amount,
        category,
        desc,
        date: new Date().toISOString().slice(0, 10)
    });

    sync();
    render();
    txForm.reset();
});

// Delete Transaction
function remove(id) {
    transactions = transactions.filter(t => t.id !== id);
    sync();
    render();
}

// Clear All
clearAllBtn.onclick = () => {
    if (!transactions.length) return;
    if (confirm("Clear all transactions?")) {
        transactions = [];
        sync();
        render();
    }
};

// Render UI
function render() {
    txTable.innerHTML = "";

    // Filter
    const filtered = transactions.filter(t => currentFilter === "all" ? true : t.type === currentFilter);

    if (!filtered.length) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }

    // Summary
    const income = transactions.filter(t=>t.type==="income").reduce((a,b)=>a+b.amount,0);
    const expense = transactions.filter(t=>t.type==="expense").reduce((a,b)=>a+b.amount,0);

    incomeValue.textContent = money(income);
    expenseValue.textContent = money(expense);
    balanceValue.textContent = money(income - expense);

    // Table
    filtered.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${t.date}</td>
            <td><span class="badge-${t.type}">${t.type}</span></td>
            <td>${t.category}</td>
            <td>${t.desc}</td>
            <td class="right">${t.type === "expense" ? "-" : "+"}${money(t.amount)}</td>
            <td><button class="delete-btn" onclick="remove(${t.id})">×</button></td>
        `;
        txTable.appendChild(row);
    });
}

// Init
render();
