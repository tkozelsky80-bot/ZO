fetch("data.csv")
  .then(response => response.text())
  .then(text => {
    const rows = text.trim().split("\n").map(r => r.split(";"));
    const data = rows.slice(1);

    const countries = [];
    const values = [];

    data.forEach(row => {
      if (row.length < 6) return;

      countries.push(row[4]);

      const value = row[5]
        .replace(/"/g, "")
        .replace(/\s/g, "")
        .replace(",", ".");

      values.push(Number(value));
    });

    new Chart(document.getElementById("chart"), {
      type: "bar",
      data: {
        labels: countries,
        datasets: [{
          label: "Stat. hodnota",
          data: values
        }]
      }
    });
  });
