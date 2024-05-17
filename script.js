function updatePrefixesTable() {
    const tbody = document.getElementById("prefixes");
    const prefixes = Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')));

    tbody.innerHTML = "";

    for (const [key, value1] of Object.entries(prefixes)) {
        if (key == "") continue;
        value = decodeURIComponent(value1);

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
        const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=.locaite.net;path=/`;
        }

        updatePrefixesTable();
    }
}

function clearPrefix(button) {
    const prefix = button
        .closest("tr")
        .querySelector("td").innerText;

    if (confirm(`Really clear prefix "${prefix}"?`)) {
        document.cookie = `${prefix}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=.locaite.net;path=/`;
        updatePrefixesTable();
    }
}

function save(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    const goto = event.target.querySelector("input.goto").value.trim();
    if (goto.length == 0) return;

    if (
        !/^[a-z0-9-]+:\/\//.test(goto) ||
        goto.slice(-1) == "/" ||
        goto.indexOf("locaite.net") >= 0
    ) {
        alert("Must start with letters, numbers, or dashes, followed by '://', not contain 'locaite.net', and not end with a slash");
        return;
    }

    const dateString = new Date((new Date).getFullYear() + 100 + "").toUTCString();
    document.cookie = `${prefix}=${encodeURIComponent(goto)};expires=${dateString};domain=.locaite.net;path=/`;
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
    setInterval(updatePrefixesTable, 5000);

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
