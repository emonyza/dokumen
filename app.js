// CONFIGURATION
const CONFIG = {
    username: "emonyza", 
    repo: "dokumen",   // Nama repository diubah ke 'dokumen'
    folder: "dokumen", // Nama folder di dalam repository
    itemsPerPage: 10
};

let allFiles = [];
let currentPage = 1;

// DOM Elements
const fileList = document.getElementById("file-list");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error-message");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageIndicator = document.getElementById("page-indicator");
const homeView = document.getElementById("home-view");
const detailView = document.getElementById("detail-view");

// Icon SVG Hijau (mirip icon CorelDRAW)
const greenIconSvg = `
<svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#2e7d32" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
</svg>`;

// Fetch daftar file dari GitHub REST API
async function fetchFilesFromGitHub() {
    const apiUrl = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${CONFIG.folder}`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Gagal mengambil data dari folder 'dokumen' di repo 'dokumen'. Pastikan repo dan foldernya sudah benar.");
        }
        
        const files = await response.json();
        
        // Mengambil semua file (mengabaikan folder dan file tersembunyi seperti .gitkeep)
        allFiles = files.filter(file => file.type === "file" && !file.name.startsWith('.'));

        loadingEl.classList.add("hidden");

        if (allFiles.length === 0) {
            errorEl.innerText = "Tidak ada file ditemukan di folder 'dokumen'.";
            return;
        }

        checkRoute();

    } catch (err) {
        loadingEl.classList.add("hidden");
        errorEl.innerText = "Error: " + err.message;
    }
}

// Menampilkan daftar file (List View 10 item per halaman)
function renderPage(page) {
    fileList.innerHTML = "";
    
    const startIndex = (page - 1) * CONFIG.itemsPerPage;
    const endIndex = startIndex + CONFIG.itemsPerPage;
    const pageItems = allFiles.slice(startIndex, endIndex);

    pageItems.forEach(file => {
        const item = document.createElement("div");
        item.className = "file-item";
        
        // Klik item untuk membuka halaman detail & unduh
        item.onclick = () => {
            window.location.hash = encodeURIComponent(file.name);
        };

        item.innerHTML = `
            <div class="file-icon">${greenIconSvg}</div>
            <div class="file-name" title="${file.name}">${file.name}</div>
        `;
        
        fileList.appendChild(item);
    });

    // Update Navigasi Pagination
    const totalPages = Math.ceil(allFiles.length / CONFIG.itemsPerPage) || 1;
    pageIndicator.innerText = `Halaman ${page} dari ${totalPages}`;
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page >= totalPages;
}

// Menampilkan Detail File
function showDetail(fileName) {
    const foundFile = allFiles.find(f => f.name === fileName);
    
    if (foundFile) {
        document.getElementById("detail-title").innerText = foundFile.name;
        document.getElementById("download-btn").href = foundFile.download_url;
        
        homeView.classList.add("hidden");
        detailView.classList.remove("hidden");
        window.scrollTo(0, 0);
    } else {
        showHome();
    }
}

// Menampilkan Home List
function showHome() {
    detailView.classList.add("hidden");
    homeView.classList.remove("hidden");
    renderPage(currentPage);
}

// Hash Routing (namaweb.com/#namafile)
function checkRoute() {
    const hash = decodeURIComponent(window.location.hash.substring(1));
    if (hash) {
        showDetail(hash);
    } else {
        showHome();
    }
}

// Event Listeners
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        window.scrollTo(0, 0);
    }
});

nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(allFiles.length / CONFIG.itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
        window.scrollTo(0, 0);
    }
});

document.getElementById("back-btn").addEventListener("click", () => {
    window.location.hash = "";
});

window.addEventListener("hashchange", checkRoute);

// Jalankan Aplikasi
fetchFilesFromGitHub();
