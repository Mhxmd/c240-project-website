// 🔥 Local Storage Key
const STORAGE_KEY = "finx_transactions";

// Wrap everything so it runs after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // 🧠 State
  let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let currentFilter = "all";
  let chart; // for Chart.js instance

  // 📌 Elements
  const txForm = document.getElementById("txForm");
  const txTable = document.getElementById("txTableBody");
  const emptyState = document.getElementById("emptyState");
  const balanceValue = document.getElementById("balanceValue");
  const incomeValue = document.getElementById("incomeValue");
  const expenseValue = document.getElementById("expenseValue");
  const clearAllBtn = document.getElementById("clearAllBtn");

  if (!txForm || !txTable || !balanceValue || !incomeValue || !expenseValue) {
    console.error("❌ Some DOM elements not found. Check your IDs in index.html.");
    return;
  }

  // ---------------- FILTER BUTTONS ----------------
  document.querySelectorAll(".menu-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".menu-item").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // ---------------- UTILITIES ----------------
  const money = (amt) => "$" + Number(amt).toFixed(2); // Format currency

  function sync() {
    // Save to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  // ---------------- ADD TRANSACTION ----------------
  txForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const type = document.getElementById("txType").value;
    const amount = parseFloat(document.getElementById("txAmount").value);
    const category =
      document.getElementById("txCategory").value.trim() || "General";
    const desc = document.getElementById("txDesc").value.trim() || "-";

    if (!amount || amount <= 0)
      return alert("Enter a valid amount greater than 0.");

    transactions.push({
      id: Date.now(),
      type,
      amount,
      category,
      desc,
      date: new Date().toISOString().slice(0, 10),
    });

    sync();
    render();
    txForm.reset();
  });

  // ---------------- DELETE ROW ----------------
  // Expose globally so onclick="remove(id)" works from HTML rows
  window.remove = function (id) {
    transactions = transactions.filter((t) => t.id !== id);
    sync();
    render();
  };

  // ---------------- CLEAR ALL ----------------
  if (clearAllBtn) {
    clearAllBtn.onclick = () => {
      if (!transactions.length) return;
      if (confirm("Clear all transactions?")) {
        transactions = [];
        sync();
        render();
      }
    };
  }

  // ---------------- CHART.JS ----------------
  function renderChart() {
    const canvas = document.getElementById("chart");
    // If no canvas or Chart.js not loaded, just skip gracefully
    if (!canvas || typeof Chart === "undefined") {
      return;
    }

    const ctx = canvas.getContext("2d");

    const categories = [...new Set(transactions.map((t) => t.category))];
    const values = categories.map((cat) =>
      transactions
        .filter((t) => t.category === cat)
        .reduce((a, b) => a + b.amount, 0)
    );

    // Destroy old chart to update properly
    if (chart) chart.destroy();

    if (!categories.length) {
      // nothing to draw yet
      return;
    }

    chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categories,
        datasets: [
          {
            data: values,
            backgroundColor: [
              "#4ade80",
              "#fb7185",
              "#00ffe7",
              "#facc15",
              "#38bdf8",
              "#a855f7",
              "#f472b6",
            ],
            borderWidth: 2,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        plugins: {
          legend: { labels: { color: "#fff", font: { size: 14 } } },
        },
      },
    });
  }

  // ---------------- RENDER UI ----------------
  function render() {
    txTable.innerHTML = "";

    // Filter logic
    const filtered = transactions.filter((t) =>
      currentFilter === "all" ? true : t.type === currentFilter
    );

    if (emptyState) {
      emptyState.style.display = filtered.length ? "none" : "block";
    }

    // Summary calculations
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((a, b) => a + b.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((a, b) => a + b.amount, 0);

    incomeValue.textContent = money(income);
    expenseValue.textContent = money(expense);
    balanceValue.textContent = money(income - expense);

    // Table rendering
    filtered.forEach((t) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${t.date}</td>
        <td><span class="badge-${t.type}">${t.type}</span></td>
        <td>${t.category}</td>
        <td>${t.desc}</td>
        <td class="right">${t.type === "expense" ? "-" : "+"}${money(
          t.amount
        )}</td>
        <td><button class="delete-btn" onclick="remove(${t.id})">×</button></td>
      `;
      txTable.appendChild(row);
    });

    renderChart(); // update chart every time UI updates
  }

  // ---------------- INIT ----------------
  render();
  console.log("🔥 FinX Dashboard Loaded");
});
