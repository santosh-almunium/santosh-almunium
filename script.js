/************ LOAD DATA ************/
let sites = JSON.parse(localStorage.getItem("sites")) || [];
let staff = JSON.parse(localStorage.getItem("staff")) || [];

/************ SAVE ************/
function saveData() {
    localStorage.setItem("sites", JSON.stringify(sites));
}
function saveStaff() {
    localStorage.setItem("staff", JSON.stringify(staff));
}

/************ ADD SITE MODAL ************/
function openAddSite() {
    document.getElementById("addSiteModal").style.display = "flex";
    document.getElementById("siteNameInput").focus();
}

function closeAddSite() {
    document.getElementById("addSiteModal").style.display = "none";
}

/************ CREATE SITE (ONLY ONE) ************/
function createSite() {
    const name = document.getElementById("siteNameInput").value.trim();
    const total = Number(document.getElementById("siteTotalInput").value) || 0;
    const taken = Number(document.getElementById("siteTakenInput").value) || 0;
    const date = document.getElementById("siteDateInput").value;
    const fileInput = document.getElementById("siteDocInput");
    const file = fileInput ? fileInput.files[0] : null;

    if (!name) {
        alert("Site name is required");
        return;
    }

    if (taken > total) {
        alert("Taken amount cannot exceed total");
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            saveSite(reader.result);
        };
        reader.readAsDataURL(file);
    } else {
        saveSite("");
    }

    function saveSite(doc) {
        sites.push({
            id: Date.now(),
            name,
            total,
            taken,
            date,
            doc
        });

        saveData();
        clearAddSiteForm();
        closeAddSite();
        showDashboard();
    }
}

function clearAddSiteForm() {
    siteNameInput.value = "";
    siteTotalInput.value = "";
    siteTakenInput.value = "";
    siteDateInput.value = "";
    if (siteDocInput) siteDocInput.value = "";
}

/************ ENTER KEY SUPPORT (FIXED) ************/
document.addEventListener("keydown", function (e) {

    const modal = document.getElementById("addSiteModal");
    if (!modal || modal.style.display !== "flex") return;

    if (e.key !== "Enter") return;
    e.preventDefault();

    const fields = [
        siteNameInput,
        siteTotalInput,
        siteTakenInput,
        siteDateInput,
        siteDocInput
    ].filter(Boolean);

    const index = fields.indexOf(document.activeElement);

    if (index === -1) return;

    if (index < fields.length - 1) {
        fields[index + 1].focus();
    } else {
        createSite(); // ✅ WORKS NOW
    }
});

/************ DASHBOARD ************/
function showDashboard() {
    detailView.style.display = "none";
    dashboard.style.display = "grid";
    addSiteBtn.style.display = "inline-block";
    staffBtn.style.display = "inline-block";

    dashboard.innerHTML = "";

    sites.forEach(site => {
        const box = document.createElement("div");
        box.className = "site-box";
        box.innerHTML = `
            <div class="site-name">${site.name}</div>
            <div class="site-amount">₹${site.total - site.taken} left</div>
        `;
        box.onclick = () => openSite(site.id);
        dashboard.appendChild(box);
    });
}

/************ OPEN SITE ************/
function openSite(id) {
    const site = sites.find(s => s.id === id);

    dashboard.style.display = "none";
    addSiteBtn.style.display = "none";
    staffBtn.style.display = "none";
    detailView.style.display = "block";

    detailView.innerHTML = `
        <div class="top-bar">
            <span class="back" onclick="showDashboard()">← Back</span>
            <span class="menu" onclick="toggleMenu()">⋮</span>

            <div id="menuBox" class="menu-box">
                <div onclick="enableEdit(${id})">✏️ Edit</div>
                <div class="danger" onclick="deleteSite(${id})">🗑 Delete</div>
            </div>
        </div>

        <h3>${site.name}</h3>

        <div class="field-card">
            <label>Date</label>
            <input id="date" type="date" value="${site.date}" disabled>
        </div>

        <div class="field-card">
            <label>Total Amount</label>
            <input id="total" type="number" value="${site.total}" disabled>
        </div>

        <div class="field-card">
            <label>Amount Taken</label>
            <input id="taken" type="number" value="${site.taken}" disabled>
        </div>

        <div class="amount-left">Amount Left: ₹${site.total - site.taken}</div>

        ${site.doc ? `
            <button onclick="viewDocument('${site.doc}')">View Document</button>
            <div id="docBox"></div>
        ` : ""}

        <div id="editButtons" style="display:none;margin-top:15px;">
            <button onclick="saveEdit(${id})">Save</button>
            <button onclick="openSite(${id})">Cancel</button>
        </div>
    `;
}

/************ MENU ************/
function toggleMenu() {
    const menu = document.getElementById("menuBox");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

/************ EDIT ************/
function enableEdit(id) {
    menuBox.style.display = "none";
    date.disabled = false;
    total.disabled = false;
    taken.disabled = false;
    editButtons.style.display = "block";
}

function saveEdit(id) {
    const site = sites.find(s => s.id === id);
    site.date = date.value;
    site.total = Number(total.value);
    site.taken = Number(taken.value);
    saveData();
    openSite(id);
}

/************ DELETE ************/
function deleteSite(id) {
    if (!confirm("Delete this site?")) return;
    sites = sites.filter(s => s.id !== id);
    saveData();
    showDashboard();
}

/************ VIEW DOCUMENT ************/
function viewDocument(doc) {
    const box = document.getElementById("docBox");
    if (doc.startsWith("data:image")) {
        box.innerHTML = `<img src="${doc}" style="width:100%">`;
    } else {
        box.innerHTML = `<iframe src="${doc}" style="width:100%;height:400px"></iframe>`;
    }
}

/************ STAFF ************/
function openStaff() {
    dashboard.style.display = "none";
    addSiteBtn.style.display = "none";
    staffBtn.style.display = "none";
    detailView.style.display = "block";

    detailView.innerHTML = `
        <span class="back" onclick="showDashboard()">← Back</span>
        <h3>Staff</h3>
        <button onclick="addStaff()">+ Add Staff</button>
        <div id="staffList"></div>
    `;
    renderStaff();
}

function renderStaff() {
    staffList.innerHTML = "";
    staff.forEach((s, i) => {
        const due = s.total - s.paid;
        staffList.innerHTML += `
            <div class="staff-card">
                <b>${s.name}</b><br>
                Days: ${s.days}<br>
                Total: ₹${s.total}<br>
                Paid: ₹${s.paid}<br>
                <b>Due: ₹${due}</b><br><br>
                <button onclick="editStaff(${i})">Edit</button>
                <button class="danger" onclick="deleteStaff(${i})">Delete</button>
            </div>
        `;
    });
}

function addStaff() {
    const name = prompt("Name");
    if (!name) return;
    staff.push({ name, days: 0, total: 0, paid: 0 });
    saveStaff();
    renderStaff();
}

function editStaff(i) {
    const s = staff[i];
    s.days = Number(prompt("Days", s.days));
    s.total = Number(prompt("Total", s.total));
    s.paid = Number(prompt("Paid", s.paid));
    saveStaff();
    renderStaff();
}

function deleteStaff(i) {
    if (!confirm("Delete staff?")) return;
    staff.splice(i, 1);
    saveStaff();
    renderStaff();
}

/************ INIT ************/
showDashboard();
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}
