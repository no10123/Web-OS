const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const loginBypass = new URLSearchParams(window.location.search).get('login') === 'true';
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const osTarget = 'index.html?login=true';
const viewport = document.getElementById("viewport"); 
const apps = document.getElementById("apps");
const wm = document.getElementById("welcome-msg");
const settingsWin = document.getElementById("settings");
const txtEditorWin = document.getElementById("txt-editor");
const codeEditorWin = document.getElementById("code-editor");
const colorPicker = document.getElementById('colorPicker');
const timeText = document.getElementById("timeElement");
const blobLayer = document.querySelector('.blob-layer');
const expHeader = document.getElementById('explorer-header');
const expBody = document.getElementById('explorer-body');
const birdCounter = document.getElementById('bird-count');
const birdColorCountInput = document.getElementById('bird-color-count');
const birdColorsContainer = document.getElementById('bird-colors-container');
const MB = document.getElementById("bird-type");

blobLayer.style.display = "none"; // temp fix

let currentTime = new Date().toLocaleString();
let width, height;
let mouseX = -1000;
let mouseY = -1000;
let isMouseDown = false;

// window states
let welcomeIsFullscreen = false;
let settingsIsFullscreen = false;
let txtEditorIsFullscreen = false;
let codeEditorIsFullscreen = false;

// birdie attributes
let birds = [];
let birdCount = 75;
const defaultBirdColors = ['#b4befe', '#cba6f7', '#cdd6f4'];
let birdColors = [...defaultBirdColors];
const maxM = 8;
let mb = 2;
let M = [0, 0, 0];
let m = 0;
let useTime = true;
let frameCount = -1;
let explorerPath = { theme: null, category: null };
let favorites = JSON.parse(localStorage.getItem('bgFavorites')) || [];

// basic stuff
function updateTime() {
    currentTime = new Date().toLocaleString();
    if (timeText) timeText.textContent = `Time: ${currentTime}`;
}
setInterval(updateTime, 1000);

function hexToRGBA(hex, alpha = 0.35) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// window stuff
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Keep visible, non-fullscreen windows centered on resize
    if (!wm.classList.contains('hidden') && !welcomeIsFullscreen) centerWindow(wm);
    if (!settingsWin.classList.contains('hidden') && !settingsIsFullscreen) centerWindow(settingsWin);
    if (!txtEditorWin.classList.contains('hidden') && !txtEditorIsFullscreen) centerWindow(txtEditorWin);
    if (!codeEditorWin.classList.contains('hidden') && !codeEditorIsFullscreen) centerWindow(codeEditorWin);
}

function getWindowBounds(elmnt) {
    const viewportRect = viewport.getBoundingClientRect();
    const windowRect = elmnt.getBoundingClientRect();
    return {
        left: Math.max(15, Math.round((viewportRect.width - windowRect.width) / 2)),
        top: Math.max(15, Math.round((viewportRect.height - windowRect.height) / 2)),
    };
}

function centerWindow(elmnt) {
    const bounds = getWindowBounds(elmnt);
    elmnt.style.left = `${bounds.left}px`;
    elmnt.style.top = `${bounds.top}px`;
    elmnt.style.transform = 'none';
}

function toggleFullscreen(elmnt, isFullscreenVar) {
    const isFS = !isFullscreenVar;
    elmnt.classList.toggle('fullscreen', isFS);
    
    if (isFS) {
        elmnt.style.left = '0px';
        elmnt.style.top = '0px';
        elmnt.style.width = '100%';
        elmnt.style.height = '100%';
    } else {
        elmnt.style.width = '';
        elmnt.style.height = '';
        centerWindow(elmnt);
    }
    return isFS;
}

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(elmnt.id + 'header');
    const dragHandle = header || elmnt;

    dragHandle.onmousedown = (e) => {
        if (elmnt.classList.contains('fullscreen')) return;
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };
        document.onmousemove = (e) => {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
            elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
            elmnt.style.transform = 'none';
        };
    };
}


function openCodeEditorWindow() { codeEditorWin.classList.remove('hidden'); centerWindow(codeEditorWin); }
function closeCodeEditorWindow() { codeEditorWin.classList.add('hidden'); }
function toggleCodeEditorFullscreen() { codeEditorIsFullscreen = toggleFullscreen(codeEditorWin, codeEditorIsFullscreen); }
function minimizeCodeEditorWindow() { closeCodeEditorWindow(); }
function openTxtEditorWindow() { txtEditorWin.classList.remove('hidden'); centerWindow(txtEditorWin); }
function closeTxtEditorWindow() { txtEditorWin.classList.add('hidden'); }
function toggleTxtEditorFullscreen() { txtEditorIsFullscreen = toggleFullscreen(txtEditorWin, txtEditorIsFullscreen); }
function minimizeTxtEditorWindow() { closeTxtEditorWindow(); }
function openWelcomeWindow() { wm.classList.remove('hidden'); centerWindow(wm); }
function closeWelcomeWindow() { wm.classList.add('hidden'); }
function toggleWelcomeFullscreen() { welcomeIsFullscreen = toggleFullscreen(wm, welcomeIsFullscreen); }
function minimizeWelcomeWindow() { closeWelcomeWindow(); }
function openSettingsWindow() { settingsWin.classList.remove('hidden'); centerWindow(settingsWin); }
function closeSettingsWindow() { settingsWin.classList.add('hidden'); }
function toggleSettingsFullscreen() { settingsIsFullscreen = toggleFullscreen(settingsWin, settingsIsFullscreen); }
function minimizeSettingsWindow() { closeSettingsWindow(); }

// BG changer
function updateBgImg(url) {
    if (!url || url === "none") {
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "#1e1e2e";
        return;
    }
    document.body.style.backgroundImage = `url("${url}")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
}

function saveFavorites() {
    localStorage.setItem('bgFavorites', JSON.stringify(favorites));
}

function handleFavorite(theme, category, imgName) {
    const existsIndex = favorites.findIndex(f => f.theme === theme && f.category === category && f.imgName === imgName);
    if (existsIndex > -1) {
        favorites.splice(existsIndex, 1);
    } else {
        favorites.push({ theme, category, imgName });
    }
    saveFavorites();
    if (explorerPath.theme === 'Favorites') renderWallpaperExplorer();
}

function renderWallpaperExplorer() {
    if (!expBody || !expHeader || typeof imageTree === 'undefined') return;

    expBody.innerHTML = '';
    expHeader.innerHTML = '';

    let breadcrumbText = `<span style="opacity: 0.6;">Root</span>`;
    
    if (explorerPath.theme) {
        const backBtn = document.createElement('button');
        backBtn.className = 'explorer-back-btn pointer';
        backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back';
        backBtn.onclick = handleExplorerBack;
        expHeader.appendChild(backBtn);
        breadcrumbText += ` / <span>${explorerPath.theme}</span>`;
    }
    if (explorerPath.category) {
        breadcrumbText += ` / <span>${explorerPath.category}</span>`;
    }
    
    const breadcrumbSpan = document.createElement('span');
    breadcrumbSpan.innerHTML = breadcrumbText;
    expHeader.appendChild(breadcrumbSpan);

    if (!explorerPath.theme) {
        createExplorerNode("none", 'fa-image', () => updateBgImg("none"));
        createExplorerNode('Favorites', 'fa-star', () => {
            explorerPath.theme = 'Favorites';
            renderWallpaperExplorer();
        });

        Object.keys(imageTree).forEach(themeName => {
            createExplorerNode(themeName, 'fa-folder', () => {
                explorerPath.theme = themeName;
                renderWallpaperExplorer();
            });
        });
    } else if (explorerPath.theme === 'Favorites') {
        if (favorites.length === 0) {
            expBody.innerHTML = '<span style="color: var(--text); opacity: 0.7; padding: 10px;">No favorites yet. Double-click an image to add it!</span>';
        } else {
            favorites.forEach(fav => {
                createExplorerNode(fav.imgName, 'fa-image', () => {
                    const fullUrl = `CozyPixels-main/${fav.theme}/${fav.category}/${fav.imgName}`;
                    updateBgImg(encodeURI(fullUrl));
                }, () => handleFavorite(fav.theme, fav.category, fav.imgName));
            });
        }
    } else if (!explorerPath.category) {
        Object.keys(imageTree[explorerPath.theme]).forEach(categoryName => {
            createExplorerNode(categoryName, 'fa-folder', () => {
                explorerPath.category = categoryName;
                renderWallpaperExplorer();
            });
        });
    } else {
        const images = imageTree[explorerPath.theme][explorerPath.category];
        images.forEach(imgName => {
            createExplorerNode(imgName, 'fa-image', () => {
                const fullUrl = `CozyPixels-main/${explorerPath.theme}/${explorerPath.category}/${imgName}`;
                updateBgImg(encodeURI(fullUrl));
            }, () => handleFavorite(explorerPath.theme, explorerPath.category, imgName));
        });
    }
}

function createExplorerNode(name, iconClass, clickCallback, dblClickCallback = null) {
    const item = document.createElement('button');
    item.className = 'explorer-item pointer';
    item.style.border = 'none';
    item.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${name.length < 20 ? name : "?"}</span>`;
    item.onclick = clickCallback;
    if (dblClickCallback) item.ondblclick = dblClickCallback;
    expBody.appendChild(item);
}

function handleExplorerBack() {
    if (explorerPath.category) {
        explorerPath.category = null;
    } else if (explorerPath.theme) {
        explorerPath.theme = null;
    }
    renderWallpaperExplorer();
}

// BIRD
const birdStates = [
    (x, y, X, Y) => ({ dx: 30, dy: 20 * Math.sin(X) }),                                      // m = 1
    (x, y, X, Y) => ({ dx: Math.cos(Y * 0.02) * 2, dy: Math.sin(X * 0.02) * 2 }),            // m = 2
    (x, y, X, Y) => ({ dx: (Math.sin(Y * 0.01) * 3) + (Math.sin(y * 0.03) * 1), dy: (Math.sin(X * 0.01) * 3) + (Math.cos(x * 0.05) * 2) }), // m = 3
    (x, y, X, Y) => ({ dx: Math.cos(Y) * 8, dy: Math.sin(X) * 8 }),                          // m = 4
    (x, y, X, Y) => ({ dx: 8, dy: Math.tan(X * 0.01) * 4 }),                                 // m = 5
    (x, y, X, Y) => ({ dx: Math.cos(Y) * 8, dy: Math.sin(X) * 8 }),                          // m = 6
    (x, y) => {                                                                              // m = 7 (Mouse Pull)
        let pull = isMouseDown ? 0.05 : 0.01;
        return { dx: -(x - mouseX) * pull, dy: -(y - mouseY) * pull };
    },
    (x, y) => {                                                                              // m = 8 (Mouse Repel)
        let dx = x - mouseX;
        let dy = y - mouseY;
        let distance = Math.sqrt(dx**2 + dy**2);
        let repelRadius = isMouseDown ? 350 : 150;
        if (distance < repelRadius && distance > 0) {
            return { dx: (dx / distance) * 12, dy: (dy / distance) * 12 };
        }
        return { dx: 2, dy: Math.sin(x * 0.02) * 2 };
    }
];

function getBirdOffsets(x, y, cm) {
    m = mb + (M[cm] || 0);
    const X = useTime ? Date.now() * 0.0015 : x;
    const Y = useTime ? Date.now() * 0.0015 : y;
    const stateIndex = ((m - 1) % maxM + maxM) % maxM;
    return birdStates[stateIndex](x, y, X, Y);
}

class Bird {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() * 1.5) + 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.Vx = this.vx;
        this.Vy = this.vy;
        
        this.cm = Math.floor(Math.random() * birdColors.length);
        this.color = birdColors[this.cm];
        
        this.size = Math.random() * 1.5 + 1;
        this.wingSpeed = (Math.random() * 0.01) + 0.005;
        this.wingOffset = Math.random() * Math.PI * 2;
    }

    update() {
        const offsets = getBirdOffsets(this.x, this.y, this.cm);
        this.Vx = this.vx + offsets.dx;
        this.Vy = this.vy + offsets.dy;
        this.x += this.Vx;
        this.y += this.Vy;

        if (this.x < -50) this.x = width + 50;
        if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.Vy, this.Vx));
        
        const flap = Math.sin(Date.now() * this.wingSpeed + this.wingOffset) * 12;
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth   = this.size;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.moveTo(-10, flap);
        ctx.lineTo(0, 0);
        ctx.lineTo(-10, -flap);
        ctx.stroke();
        ctx.restore();
    }

    updateColor() {
        this.cm = Math.floor(Math.random() * birdColors.length);
        this.color = birdColors[this.cm];
    }
}

function updateBirdColors() {
    if (!birdColorCountInput) return;
    birdColorCountInput.value = String(birdColors.length);
    birdColorsContainer.querySelectorAll('input[type="color"]').forEach(input => input.remove());

    birdColors.forEach((birdColor, index) => {
        const input = document.createElement('input');
        input.className = 'copy pointer';
        input.type = 'color';
        input.value = birdColor;
        input.dataset.index = String(index);
        input.addEventListener('input', (event) => {
            birdColors[index] = event.target.value;
            birds.forEach(bird => bird.updateColor());
        });
        birdColorsContainer.appendChild(input);
    });

    birds.forEach(bird => bird.updateColor());
}

function setBirdColorCount(nextCount) {
    const targetCount = Math.max(1, Number(nextCount) || 1);
    while (birdColors.length < targetCount) {
        birdColors.push(defaultBirdColors[birdColors.length % defaultBirdColors.length]);
    }
    birdColors.length = targetCount;
    updateBirdColors();
}

// stuff that gets triggered
function showLoginError(message) {
    if(loginError) loginError.textContent = message;
}

function hideLogin() {
    loginOverlay.classList.remove('active');
    loginOverlay.setAttribute('aria-hidden', 'true');
    if(loginError) loginError.textContent = '';
    if(loginForm) loginForm.reset();
}

const actions = {
    // general controls
    toggleLogin: () => {
        if (loginOverlay.classList.contains('active')) hideLogin();
        else {
            loginOverlay.classList.add('active');
            loginOverlay.setAttribute('aria-hidden', 'false');
        }
    },
    toggleCT: (btn) => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            if(btn) btn.textContent = 'Light';
            document.body.style.filter = 'invert(1) hue-rotate(180deg)';
        } else {
            if(btn) btn.textContent = 'Dark';
            document.body.style.filter = 'none';
        }
    },

    // Bird controls
    copyColor: async () => await navigator.clipboard.writeText("#a6e3a1"),
    nextBirdType: () => { mb = (mb % maxM) + 1; if(MB) MB.textContent = mb; },
    randomBirdType: () => { mb = Math.ceil(Math.random() * maxM); if(MB) MB.textContent = mb; },
    addBird: () => {
        birdCount += 1;
        birds.push(new Bird());
        if(birdCounter) birdCounter.value = String(birdCount);
    },
    removeBird: () => {
        if (birds.length > 0) {
            birds.pop();
            birdCount = Math.max(0, birdCount - 1);
            if(birdCounter) birdCounter.value = String(birdCount);
        }
    },
    addBirdColor: () => setBirdColorCount(Math.min(birdColors.length + 1, 8)),
    removeBirdColor: () => setBirdColorCount(Math.max(birdColors.length - 1, 1))
};

function setupEventListeners() {
    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    window.addEventListener('mousedown', () => isMouseDown = true);
    window.addEventListener('mouseup', () => isMouseDown = false);
    window.addEventListener('resize', resize);
    document.addEventListener('click', (event) => {
        const target = event.target.closest('[data-action]'); 
        if (target && actions[target.dataset.action]) {
            actions[target.dataset.action](target);
        }
    });

    if (birdCounter) {
        birdCounter.addEventListener('input', () => {
            let diff = (parseInt(birdCounter.value, 10) || 0) - birdCount;
            if (diff > 0) {
                for (let j = 0; j < diff; j++) actions.addBird();
            } else if (diff < 0) {
                diff = Math.abs(diff);
                for (let j = 0; j < diff; j++) actions.removeBird();
            }
        });
    }

    if (birdColorCountInput) {
        birdColorCountInput.addEventListener('input', (e) => setBirdColorCount(e.target.value));
    }

    if (colorPicker) {
        colorPicker.addEventListener('input', (event) => {
            const color = event.target.value;
            const rgba = hexToRGBA(color, 0.35);
            document.querySelectorAll('.frosted-glass').forEach((el) => {
                el.style.backgroundColor = rgba;
            });
            if (blobLayer) {
                blobLayer.style.background = `radial-gradient(circle at 30% 30%, ${hexToRGBA(color, 0.32)}, rgba(57,25,55,0.75))`;
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = loginUsername.value.trim();
            const password = loginPassword.value;
            if (username === 'robopugo' && password === 'Birb103!') {
                hideLogin();
                window.location.replace(osTarget);
            } else {
                showLoginError('Wrong username or password.');
            }
        });
    }
}

function init() {
    resize();
    setupEventListeners();

    for (let i = 0; i < birdCount; i++) birds.push(new Bird());
    if(birdCounter) birdCounter.value = String(birdCount);
    updateBirdColors();

    // ui
    if (!wm.classList.contains('hidden')) centerWindow(wm);
    if (!settingsWin.classList.contains('hidden')) centerWindow(settingsWin);
    
    dragElement(wm);
    dragElement(settingsWin);
    dragElement(txtEditorWin);
    dragElement(codeEditorWin);

    renderWallpaperExplorer();

    if (loginBypass) hideLogin();

    window.BirbOSGateway = {
        loginBypass,
        hideLogin,
        showLoginError,
        openWelcomeWindow: openWelcomeWindow,
        openSettingsWindow: openSettingsWindow
    };

    requestAnimationFrame(animateBirds);
}

function animateBirds() {
    ctx.clearRect(0, 0, width, height);

    birds.forEach(bird => {
        bird.update();
        bird.draw(); 
    });

    if (frameCount > 0) frameCount += 1;
    if (frameCount % 120 === 0) {
        m = (m % maxM) + 1;
    }

    requestAnimationFrame(animateBirds);
}

// Start everything up
init();

// Ensure all windows are hidden at startup
document.getElementById('welcome-msg').classList.add('hidden');
document.getElementById('txt-editor').classList.add('hidden');
document.getElementById('code-editor').classList.add('hidden');
document.getElementById('settings').classList.add('hidden');