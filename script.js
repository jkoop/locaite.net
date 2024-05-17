
function updatePrefixesTable() {
    const tbody = document.getElementById("prefixes");
    const prefixes = { ...localStorage };

    tbody.innerHTML = "";

    for (const [key, value] of Object.entries(prefixes)) {
        console.log(`${key}: ${value}`);

        const row = document.createElement("tr");
        const prefix = document.createElement("td");
        const target = document.createElement("td");
        const buttonP = document.createElement("td");
        const button = document.createElement("button");

        prefix.innerText = key;
        target.innerText = value;

        button.setAttribute("type", "button");
        button.setAttribute("onclick", "clearPrefix(this)");
        button.innerText = "Clear";

        buttonP.append(button);
        row.append(prefix, target, buttonP);
        tbody.append(row);
    }

    if (tbody.innerHTML.length < 5) {
        tbody.innerHTML =
            "<tr><td colspan=3><i>You don't have any prefixes configured yet.</i>";
    }
}

function clearPrefixes() {
    if (confirm("Really clear all prefixes?")) {
        localStorage.clear();
        updatePrefixesTable();
    }
}

function clearPrefix(button) {
    const prefix = button
        .closest("tr")
        .querySelector("td").innerText;

    if (confirm(`Really clear prefix "${prefix}"?`)) {
        localStorage.removeItem(prefix);
        updatePrefixesTable();
    }
}

function save(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    const goto = event.target.querySelector("input.goto").value;
    if (goto.length == 0) return;

    localStorage.setItem(prefix, goto);
    location.href =
        goto + location.href.slice(location.origin.length);
}

function hashChange() {
    if (location.hash == "#privacy") {
        document.getElementById("privacy").style.backgroundColor =
            "#ff0";
    }
}

if (prefix.length == 0) {
    document.querySelector("div.card.main").style.display = "block";
    updatePrefixesTable();

    hashChange();
    window.addEventListener("hashchange", hashChange);
} else {
    document.getElementById("prefix").innerText = prefix;
    document.getElementById("path").innerText = path;
    document.querySelector(
        "input.goto"
    ).placeholder = `http://${prefix}.test:8080`;
    document.querySelector("form.card.redirect").style.display =
        "block";
}
