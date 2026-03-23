let chartInstance = null;
let rawRows = [];

function parseNumber(value) {
  return Number(
    String(value)
      .replace(/"/g, "")
      .replace(/\s/g, "")
      .replace(",", ".")
  );
}

function getSelectedTradeFlow() {
  const selected = document.querySelector('input[name="tradeFlow"]:checked');
  return selected ? selected.value : "export";
}

function filterData(rows) {
  const goodsCode = document.getElementById("goodsCode").value.trim();
  const tradeFlow = getSelectedTradeFlow();

  return rows.filter(row => {
    if (row.length < 6) return false;

    const code = String(row[1]).replace(/"/g, "").trim();

    if (goodsCode && !code.startsWith(goodsCode)) {
      return false;
    }

    // Zatím je přepínač vývoz/dovoz jen připraven v rozhraní.
    // Jakmile budeme mít v datech rozlišení směru obchodu,
    // doplníme sem skutečné filtrování.
    if (tradeFlow === "export") return true;
    if (tradeFlow === "import") return true;

    return true;
  });
}

function aggregateByCountry(rows) {
  const sums = {};

  rows.forEach(row => {
    const country = String(row[4]).replace(/"/g, "").trim();
    const value = parseNumber(row[5]);

    if (!country || Number.isNaN(value)) return;

    sums[country] = (sums[country] || 0) + value;
  });

  return Object.entries(sums).sort((a, b) => b[1] - a[1]);
}

function renderChart(rows) {
  const aggregated = aggregateByCountry(rows);

  const labels = aggregated.map(item => item[0]);
  const values = aggregated.map(item => item[1]);

  const ctx = document.getElementById("chart");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Stat. hodnota",
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}

function renderTable(rows) {
  const table = document.getElementById("table");
  table.innerHTML = "";

  if (!rawRows.length) return;

  const headers = rawRows[0];

  const headerRow = document.createElement("tr");
  headers.forEach(cell => {
    const th = document.createElement("th");
    th.textContent = String(cell).replace(/"/g, "");
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  rows.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = String(cell).replace(/"/g, "");
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
}

function applyFilters() {
  const dataRows = rawRows.slice(1);
  const filtered = filterData(dataRows);

  renderChart(filtered);
  renderTable(filtered);
}

fetch("data.csv")
  .then(response => response.text())
  .then(text => {
    rawRows = text
      .trim()
      .split("\n")
      .map(row => row.split(";"));

    applyFilters();

    document
      .getElementById("applyFilters")
      .addEventListener("click", applyFilters);
  })
  .catch(error => {
    console.error("Chyba při načítání CSV:", error);
  });
