var cookie = null;
var copiedChipTimeouts = [];
const privacyPolicy =
  "Privacy: locaite.net is a static site. None of your data is stored by locaite.net.";

function updatePrefixesTable() {
  if (cookie !== null && cookie == document.cookie) return; // nothing to do; avoid interrupting the user filling out the form to save a prefix

  const tbody = document.getElementById("prefixes");
  const prefixes = document.cookie
    .split("; ")
    .map((c) => c.split("="))
    .sort();

  tbody.innerHTML = "";

  for (const [key, value1] of prefixes) {
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

  tbody.innerHTML =
    `<tr><td><input type="text" form="savePrefixForm" id="savePrefixPrefix" placeholder="myproject" /></td><td><input type="text" form="savePrefixForm" id="savePrefixTarget" placeholder="http://localhost:8080" /></td><td><button type="submit" form="savePrefixForm">Save</button></td></tr>` +
    tbody.innerHTML;

  cookie = document.cookie;
  fromLocalLink(document.getElementById("localLink"));
}

function fromLocalLink(input) {
  let localLink = input.value.trim();
  const locaiteLinks = document.getElementById("locaiteLinks");
  copiedChipTimeouts.forEach((id) => clearTimeout(id));
  copiedChipTimeouts = [];
  locaiteLinks.innerHTML = "";

  if (localLink.length == 0) return;

  try {
    localLink = new URL(localLink);
  } catch (e) {
    locaiteLinks.innerHTML = `<small class="text-red">Must be a URL</small>`;
    return;
  }

  document.cookie
    .split("; ")
    .map((c) => c.split("="))
    .forEach(([prefix, target]) => {
      target = decodeURIComponent(target);
      let matches = localLink.href.startsWith(target);

      if (matches) {
        let span = document.createElement("span");
        span.classList.add("ellipsis");
        span.style.flexGrow = 1;
        span.innerText = `https://${prefix}.locaite.net/${localLink.href.substring(localLink.href.length - localLink.hash.length - localLink.search.length - localLink.pathname.length + 1)}`;
        locaiteLinks.innerHTML += `<div class="locaite-link"><small class="nowrap">Locaite link:</small>${span.outerHTML}<button type="button" onclick="copyLocaiteLink(this)">Copy</button><button type="button" class="markdown" onclick="copyLocaiteLinkAsMarkdown(this)">as Markdown</button></div>`;
      }
    });

  if (locaiteLinks.innerHTML.length < 5) {
    locaiteLinks.innerHTML = `<small class="text-red">No prefixes match. Create one below.</small>`;
  }
}

/**
 * @param {KeyboardEvent} event
 */
function copyDefaultLocaiteLink(event) {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.key != "Enter"
  )
    return;

  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();

  const button = document.querySelector(".locaite-link button.markdown");
  if (button == null) return;

  copyLocaiteLinkAsMarkdown(button);
}

function copyLocaiteLink(button) {
  const row = button.closest("div");
  const url = row.querySelector(".ellipsis").innerText;
  navigator.clipboard.writeText(url);

  button.style.border = "none";
  button.style.backgroundColor = "green";
  button.innerText = "copied!";

  const timeoutId = setTimeout(() => {
    const id = `button${copiedChipTimeouts.shift()}`;
    document.getElementById(id).style.border = "";
    document.getElementById(id).style.backgroundColor = "";
    document.getElementById(id).innerText = "Copy";
  }, 2000);
  button.id = `button${timeoutId}`;
  copiedChipTimeouts.push(timeoutId);
}

function copyLocaiteLinkAsMarkdown(button) {
  const row = button.closest("div");
  const url = row.querySelector(".ellipsis").innerText;
  const text = url.replace("https://", "//").replace(".locaite.net", "");
  navigator.clipboard.writeText(`[${me(text)}](${me(url)})`);

  button.style.border = "none";
  button.style.backgroundColor = "green";
  button.innerText = "copied!";

  const timeoutId = setTimeout(() => {
    const id = `button${copiedChipTimeouts.shift()}`;
    document.getElementById(id).style.border = "";
    document.getElementById(id).style.backgroundColor = "";
    document.getElementById(id).innerText = "as Markdown";
  }, 2000);
  button.id = `button${timeoutId}`;
  copiedChipTimeouts.push(timeoutId);
}

/**
 * HTML-escape the string
 * @param {string} string
 * @returns {string}
 */
function he(string) {
  const span = document.createElement("span");
  span.innerText = string;
  return span.innerHTML;
}

/**
 * Markdown-escape the string
 * @param {string} string
 * @returns {string}
 */
function me(string) {
  return he(string).replace(/([\\\[\]_!.(){}*#`+-])/g, `\\$1`);
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
  const prefix = button.closest("tr").querySelector("td").innerText;

  if (confirm(`Really clear prefix "${prefix}"?`)) {
    document.cookie = `${prefix}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=.locaite.net;path=/`;
    updatePrefixesTable();
  }
}

/**
 * @param {string} prefix
 * @returns {string|false}
 */
function normalizePrefix(prefix) {
  prefix = prefix.toLowerCase();

  if (
    !/^[a-z0-9-]+$/.test(prefix) ||
    prefix.slice(-1) == "-" ||
    prefix[0] == "-"
  ) {
    alert(
      "Must contain only letters, numbers, and dashes, and not begin or end with a dash",
    );
    return false;
  }

  return prefix;
}

/**
 * @param {string} target
 * @returns {string|false}
 */
function normalizeTarget(target) {
  let url;

  try {
    url = new URL(target);
  } catch (e) {
    alert("Must be a URL");
    return false;
  }

  if (url.hash.length > 0 || url.search.length > 0) {
    alert("Must not contain a querystring or fragment hash");
    return false;
  }

  if (url.href.slice(-1) != "/") {
    alert("Must end with a slash");
    return false;
  }

  if (url.hostname == "locaite.net" || url.hostname.endsWith(".locaite.net")) {
    alert("Must not directly reference locaite.net");
    return false;
  }

  return url.href;
}

function savePrefix(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();

  const prefix = normalizePrefix(
    document.getElementById("savePrefixPrefix").value.trim(),
  );
  if (prefix === false) return;

  const target = normalizeTarget(
    document.getElementById("savePrefixTarget").value.trim(),
  );
  if (target === false) return;

  if (
    (Object.fromEntries(document.cookie.split("; ").map((c) => c.split("=")))[
      prefix
    ] ?? null) !== null &&
    !confirm(`Overwrite prefix "${prefix}"?`)
  ) {
    return;
  }

  const dateString = new Date(
    new Date().getFullYear() + 100 + "",
  ).toUTCString();
  document.cookie = `${prefix}=${encodeURIComponent(target)};expires=${dateString};domain=.locaite.net;path=/`;
  updatePrefixesTable();
}

function save(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();

  const target = normalizeTarget(
    event.target.querySelector("#goto").value.trim(),
  );
  if (target.length == 0) return;
  if (target === false) return;

  const dateString = new Date(
    new Date().getFullYear() + 100 + "",
  ).toUTCString();
  document.cookie = `${prefix}=${encodeURIComponent(target)};expires=${dateString};domain=.locaite.net;path=/`;
  location.href = target + location.href.slice(location.origin.length);
}

function hashChange() {
  if (location.hash == "#privacy") {
    alert(privacyPolicy);
  }
}
