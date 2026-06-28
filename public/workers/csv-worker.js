// public/workers/csv-worker.js
self.onmessage = function (e) {
  const { text, delimiter } = e.data;
  if (!text) {
    self.postMessage({ success: false, error: "Empty file content" });
    return;
  }

  try {
    // 1. Sniff delimiter if set to 'auto'
    let separator = ",";
    if (delimiter === "auto") {
      const firstLine = text.split(/\r?\n/)[0] || "";
      const commas = (firstLine.match(/,/g) || []).length;
      const semicolons = (firstLine.match(/;/g) || []).length;
      const tabs = (firstLine.match(/\t/g) || []).length;
      const pipes = (firstLine.match(/\|/g) || []).length;

      if (semicolons > commas && semicolons > tabs && semicolons > pipes) {
        separator = ";";
      } else if (tabs > commas && tabs > semicolons && tabs > pipes) {
        separator = "\t";
      } else if (pipes > commas && pipes > semicolons && pipes > tabs) {
        separator = "|";
      }
    } else {
      separator = delimiter;
    }

    // 2. High-performance CSV parser supporting quotes & double quotes
    const lines = [];
    let row = [];
    let inQuotes = false;
    let currentValue = "";
    let i = 0;
    const len = text.length;

    while (i < len) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentValue += '"';
            i += 2; // skip double double-quotes
            continue;
          } else {
            inQuotes = false;
          }
        } else {
          currentValue += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === separator) {
          row.push(currentValue.trim());
          currentValue = "";
        } else if (char === "\r" || char === "\n") {
          if (char === "\r" && nextChar === "\n") {
            i++;
          }
          row.push(currentValue.trim());
          // Push row if it's not entirely empty cells
          if (row.length > 0 && row.some(cell => cell !== "")) {
            lines.push(row);
          }
          row = [];
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      i++;
    }

    // Add trailing row if exists
    if (row.length > 0 || currentValue !== "") {
      row.push(currentValue.trim());
      if (row.some(cell => cell !== "")) {
        lines.push(row);
      }
    }

    self.postMessage({ success: true, delimiterUsed: separator, lines });
  } catch (err) {
    self.postMessage({ success: false, error: err.message || "Failed parsing CSV" });
  }
};
