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

function cleanText(value) {
  return String(value).replace(/"/g, "").trim();
}

function getSelectedTradeFlow() {
  const selected = document.querySelector('input[name="tradeFlow"]:checked');
  return selected ? selected.value : "export";
}

function populateGoodsSelect(rows) {
  const select = document.getElementById("goodsCode");
  const goodsMap = new Map();

  rows.forEach(row => {
    if (row.length < 6) return;

    const code = cleanText(row[1]);
    const name = cleanText(row[2]);

    if (!code) return;

    if (!goodsMap.has(code)) {
      goodsMap.set(code, name);
    }
  });

  const sortedGoods = Array.from(goodsMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], "cs")
  );

  sortedGoods.forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name ? `${code} – ${name}` : code;
    select.appendChild(option);
  });
}

function filterData(rows) {
  const goodsCode = document.getElementById("goodsCode").value;
  const tradeFlow = getSelectedTradeFlow();

  return rows.filter(row => {
    if (row.length < 6) return false;

    const code = cleanText(row[1]);

    if (goodsCode && code !== goodsCode) {
      return false;
    }

    // Zatím připraveno jen v UI.
    // Až bude v datech skutečný směr obchodu,
    // doplníme sem logiku pro export/import.
    if (tradeFlow === "export") return true;
    if (tradeFlow === "import") return true;

    return true;
  });
}

return Object.entries(sums)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10); // 👈 TADY JE TEN KLÍČ
  const sums = {};

  rows.forEach(row => {
    const country = cleanText(row[4]);
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
    th.textContent = cleanText(cell);
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  rows.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cleanText(cell);
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

    populateGoodsSelect(rawRows.slice(1));
    applyFilters();

    document
      .getElementById("applyFilters")
      .addEventListener("click", applyFilters);
  })
  .catch(error => {
    console.error("Chyba při načítání CSV:", error);
  });
