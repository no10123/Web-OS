const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const loginBypass = new URLSearchParams(window.location.search).get('login') === 'true';
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const osTarget = 'index.html?login=true';

const colorPicker = document.getElementById('colorPicker');
const timeText = document.getElementById("timeElement");
const blobLayer = document.querySelector('.blob-layer');
const expHeader = document.getElementById('explorer-header');
const expBody = document.getElementById('explorer-body');
const birdCounter = document.getElementById('bird-count');
const birdColorCountInput = document.getElementById('bird-color-count');
const birdColorsContainer = document.getElementById('bird-colors-container');
const MB = document.getElementById("bird-type");
const searchbar = document.getElementById("searchbar");
const searchwindow = document.getElementById("searchwindow");

blobLayer.style.display = "none";

let currentTime = new Date().toLocaleString();
let width, height;
let mouseX = -1000;
let mouseY = -1000;
let isMouseDown = false;

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

const calcDisplay = document.getElementById("calc-display");
const calcButtons = document.getElementById("calculator-buttons");
let currentCalcString = "";

let isSelecting = false;
let selectionBox = null;
let startSelX = 0;
let startSelY = 0;
let selectedApps = new Set();
let selectedWindows = new Set();

class AppManager {
    constructor() {
        this.apps = new Map();
        this.centerWindow = this.centerWindow.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
    }
    registerApp(element, id) {
        this.apps.set(id, {
            element: element,
            isVisible: false,
            isFullscreen: false
        });
    }
    centerWindow(id, offsetMultiplier = 0) {
        const app = this.apps.get(id);
        const elmnt = app.element;
        const viewportRect = document.getElementById("viewport").getBoundingClientRect();
        const windowRect = elmnt.getBoundingClientRect();
        const offset = offsetMultiplier * 25;
        const left = Math.max(15, Math.round((viewportRect.width - windowRect.width) / 2)) + offset;
        const top = Math.max(15, Math.round((viewportRect.height - windowRect.height) / 2)) + offset;
        elmnt.style.left = `${left}px`;
        elmnt.style.top = `${top}px`;
        elmnt.style.transform = 'none';
    }
    
   	openApp(id) {
    	const app = this.apps.get(id);
    	if (!app) {
        	console.error(`No app "${id}"`);
        	return;
    	}
    	app.isVisible = true;
    	const elmnt = app.element;

    	elmnt.classList.remove("hidden");
        elmnt.classList.remove("fullscreen");
        this.centerWindow(id);

        let visibleCount = 0;
        this.apps.forEach(a => {
            if (a.isVisible) visibleCount++;
        });
        this.centerWindow(id, visibleCount - 1);
    }

    closeApp(id) {
        const app = this.apps.get(id);
        app.element.classList.add('hidden');
        app.isVisible = false;
    }
    minApp(id) {
        this.closeApp(id);
    }
    toggleFullscreen(id) {
        const app = this.apps.get(id);
        const elmnt = app.element;
        let newFullscreenState = !app.isFullscreen;
        app.isFullscreen = newFullscreenState;
        elmnt.classList.toggle('fullscreen', newFullscreenState);
        
        if (newFullscreenState) {
            elmnt.dataset.prevLeft = elmnt.style.left;
            elmnt.dataset.prevTop = elmnt.style.top;
            elmnt.style.left = '0px';
            elmnt.style.top = '0px';
            elmnt.style.width = '100%';
            elmnt.style.height = '100%';
            elmnt.style.zIndex = '9999';
        } else {
            elmnt.style.width = '';
            elmnt.style.height = '';
            elmnt.style.zIndex = '';
            if (elmnt.dataset.prevLeft && elmnt.dataset.prevTop) {
                elmnt.style.left = elmnt.dataset.prevLeft;
                elmnt.style.top = elmnt.dataset.prevTop;
            } else {
                this.centerWindow(id); 
            }
        }
    }
    isAppVisible(id) {
        const app = this.apps.get(id);
        return app ? !app.element.classList.contains('hidden') : false;
    }
}

const AMI = new AppManager();
window.AMI = AMI;
window.AppManager = AMI;

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

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    AMI.apps.forEach((app, id) => {
        if (AMI.isAppVisible(id) && !app.isFullscreen) {
            AMI.centerWindow(id);
        }
    });
}

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(elmnt.id + '-header');
    const dragHandle = elmnt.querySelector('.drag');

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

function setupAppLauncher(appIcon, appId) {
    appIcon.addEventListener('click', (e) => {
        if (e.button !== 0) return; 
        
        if (appId) {
            AMI.openApp(appId);
        }
    });
}

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
        createExplorerNode("upload-img", 'fa-upload', () => {}, "input");
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
                },"btn", () => handleFavorite(fav.theme, fav.category, fav.imgName));
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
            },"btn", () => handleFavorite(explorerPath.theme, explorerPath.category, imgName));
        });
    }
}

function createExplorerNode(name, iconClass, clickCallback, type="btn", dblClickCallback = null) {
    const item = document.createElement((type == "btn") ? 'button' : 'div');
    item.className = 'explorer-item pointer';
    item.style.border = 'none';
    if (type == "btn") {
        item.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${name.length < 20 ? name : "?"}</span>
        `;
    } else if (type == "input") {
        item.innerHTML = `
            <label style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <i class="fa-solid ${iconClass}"></i>
                <span>${name}</span>
                <input type="file" accept="image/*" style="display: none;" />
            </label>
        `;

        const fileInput = item.querySelector('input');
        fileInput.addEventListener('change', (e) => {
            const uploadedFile = e.target.files[0];
            if (uploadedFile) {
                const imgUrl = URL.createObjectURL(uploadedFile);
                updateBgImg(imgUrl);
            }
        });
    }
    item.onclick = clickCallback;
    
    if (dblClickCallback) {
        item.ondblclick = dblClickCallback;
    }
    
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

//BIRB
const birdStates = [
    (x, y, X, Y) => ({ dx: 30, dy: 20 * Math.sin(X) }),                                      
    (x, y, X, Y) => ({ dx: Math.cos(Y * 0.02) * 2, dy: Math.sin(X * 0.02) * 2 }),            
    (x, y, X, Y) => ({ dx: (Math.sin(Y * 0.01) * 3) + (Math.sin(y * 0.03) * 1), dy: (Math.sin(X * 0.01) * 3) + (Math.cos(x * 0.05) * 2) }), 
    (x, y, X, Y) => ({ dx: Math.cos(Y) * 8, dy: Math.sin(X) * 8 }),                          
    (x, y, X, Y) => ({ dx: 8, dy: Math.tan(X * 0.01) * 4 }),                                 
    (x, y, X, Y) => ({ dx: Math.cos(Y) * 8, dy: Math.sin(X) * 8 }),                          
    (x, y) => {                                                                             
        let pull = isMouseDown ? 0.05 : 0.01;
        return { dx: -(x - mouseX) * pull, dy: -(y - mouseY) * pull };
    },
    (x, y) => {                                                                             
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

function showLoginError(message) {
    if(loginError) loginError.textContent = message;
}

function handleCalculatorInput(value) {
    if (value === "AC") {
        currentCalcString = "";
    } else if (value === "=") {
        try {
            currentCalcString = eval(currentCalcString).toString();
        } catch {
            currentCalcString = "Error";
        }
    } else {
        currentCalcString += value;
    }
    calcDisplay.textContent = currentCalcString || "0";
}

function hideLogin() {
    loginOverlay.classList.remove('active');
    loginOverlay.setAttribute('aria-hidden', 'true');
    if(loginError) loginError.textContent = '';
    if(loginForm) loginForm.reset();
}

function parseAppHTML(htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    return {
        title:
            doc.querySelector("title")?.textContent ||
            "Untitled App",

        icon:
            doc.querySelector(
                'meta[name="app-icon"]'
            )?.content ||
            "fa-file",

        width:
            parseInt(
                doc.querySelector(
                    'meta[name="app-width"]'
                )?.content
            ) || 700,

        height:
            parseInt(
                doc.querySelector(
                    'meta[name="app-height"]'
                )?.content
            ) || 500,

        author:
            doc.querySelector(
                'meta[name="app-author"]'
            )?.content ||
            "Unknown",

        version:
            doc.querySelector(
                'meta[name="app-version"]'
            )?.content ||
            "1.0.0",

        styles:
            [...doc.querySelectorAll("style")]
                .map(s => s.textContent)
                .join("\n"),

        scripts:
            [...doc.querySelectorAll("script")]
                .map(s => s.textContent),

        body:
            doc.body.innerHTML
    };
}

async function loadAppFile(file) {
    const text = await file.text();
    const app = parseAppHTML(text);
    const customName = document.getElementById("customAppName")?.value.trim();
    let customIcon = document.getElementById("customAppIcon")?.value.trim().toLowerCase();
	if (customIcon && !customIcon.startsWith("fa-")) customIcon = "fa-" + customIcon;
    if (customName) app.title = customName;
    if (customIcon) app.icon = customIcon;
    createDynamicApp(app);
}

function createDynamicApp(app) {
    const id = app.title.toLowerCase().replace(/\s+/g, "-");
    // launcher
    const launcher = document.createElement("button");
    launcher.className = "app-launcher";
    launcher.innerHTML = `
        <i class="fa-solid ${app.icon}
           fa-2x appName app-icon-margin"></i>

        <span class="appName">
            ${app.title}
        </span>`;
    launcher.onclick = () => AMI.openApp(id);
    document.getElementById("apps").appendChild(launcher);

    // window

    const windowEl = document.createElement("div");
    windowEl.className = "dragable hidden";
    windowEl.id = id;
    windowEl.style.width = `${app.width}px`;
    windowEl.innerHTML = `
        <div class="drag">
            <i class="fa-solid ${app.icon}"></i>

            <span class="wTitle">
                ${app.title}
            </span>

            <div class="window-controls">
                <button onclick="AMI.minApp('${id}')">-</button>
                <button onclick="AMI.toggleFullscreen('${id}')">[]</button>
                <button onclick="AMI.closeApp('${id}')">x</button>
            </div>
        </div>

        <div class="text frosted-glass flex-col-window" id="${id}-Window"></div>`;

	document.getElementById("windows").appendChild(windowEl);
	AMI.registerApp(windowEl, id);
	dragElement(windowEl);

	const windowBody = document.getElementById(`${id}-Window`);
    const iframe = document.createElement("iframe");

	windowBody.style.padding = "0";
	windowBody.style.overflow = "hidden";
    
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.background = "white";
    iframe.sandbox = "allow-scripts allow-forms";
	iframe.style.display = "block";
    iframe.srcdoc = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
    ${app.styles}
    </style>
    </head>
    <body>
    ${app.body}
    
    <script>
    ${app.scripts.join("\n")}
    <\/script>
    </body>
    </html>`;
    windowBody.appendChild(iframe);
}

const actions = {
    toggleLogin: () => {
        if (loginOverlay.classList.contains('active')) hideLogin();
        else {
            loginOverlay.classList.add('active');
            loginOverlay.setAttribute('aria-hidden', 'false');
        }
    },
    toggleCT: (btn) => {
        document.body.classList.toggle('dark-mode');
        if (btn) {
            btn.textContent = document.body.classList.contains('dark-mode') ? 'Light' : 'Dark';
        }
    },

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
    removeBirdColor: () => setBirdColorCount(Math.max(birdColors.length - 1, 1)),
};

function visitSite(url) {
    searchwindow.src = url;
    searchbar.value  = url;
}

// clock stuff
/*
import { createTimer } from 'animejs/timer';
const [ $time, $count ] = utils.$('.value');
const timer = createTimer({
  duration: 1000,
  loop: true,
  frameRate: 30,
  onUpdate: self => $time.innerHTML = self.currentTime,
  onLoop: self => $count.innerHTML = self._currentIteration
});
*/

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

    document
    .getElementById("appUpload")
    .addEventListener("change", e => {

        const file = e.target.files[0];

        if (!file) return;

        loadAppFile(file);
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
    
    if (calcButtons) {
        calcButtons.addEventListener('click', (event) => {
            const btn = event.target.closest('.Calc-btn');
            if (btn) {
                handleCalculatorInput(btn.dataset.value);
            }
        });
    }

    if (searchbar && searchwindow) {
        searchbar.addEventListener('input', (event) => {
            searchwindow.src = searchbar.value;
        });
        searchwindow.onerror = () => {
            alert("this site is not allowed.");
        };
    }

    const initAnime = () => {
        anime({
            targets: '.bookmark',
            translateY: [-20, 0],
            opacity: [0, 1],
            delay: anime.stagger(100), 
            easing: 'spring(1, 80, 10, 0)'
        });
    
        const bookmarks = document.querySelectorAll('.bookmark');
    
        bookmarks.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                anime({
                    targets: btn,
                    scale: 1.1,
                    rotate: anime.random(-3, 3),
                    easing: 'spring(1, 80, 10, 0)',
                    duration: 400
                });
            });

            btn.addEventListener('mouseleave', () => {
                anime({
                    targets: btn,
                    scale: 1,
                    rotate: 0,
                    easing: 'spring(1, 50, 10, 0)',
                    duration: 400
                });
            });
    
            btn.addEventListener('mousedown', () => {
                anime({
                    targets: btn,
                    scale: 0.95,
                    easing: 'easeOutQuint',
                    duration: 150
                });
            });
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAnime);
    } else {
        initAnime();
    }

    window.addEventListener('mousedown', (e) => {
        if (e.target.closest('.dragable') || e.target.closest('.app-launcher') || e.target.closest('#settings')) {
            return; 
        }
    
        isSelecting = true;
        startSelX = e.clientX;
        startSelY = e.clientY;
    
        selectedApps.forEach(app => app.classList.remove('selected'));
        selectedApps.clear();
    
        selectionBox = document.createElement('div');
        selectionBox.classList.add('selection-box');
        selectionBox.style.left = `${startSelX}px`;
        selectionBox.style.top = `${startSelY}px`;
        document.body.appendChild(selectionBox);
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!isSelecting || !selectionBox) return;
    
        const currentX = e.clientX;
        const currentY = e.clientY;
        const left = Math.min(startSelX, currentX);
        const top = Math.min(startSelY, currentY);
        const width = Math.abs(currentX - startSelX);
        const height = Math.abs(currentY - startSelY);
    
        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
    
        const boxRect = selectionBox.getBoundingClientRect();
        
        document.querySelectorAll('.app-launcher').forEach(appEl => {
            const appRect = appEl.getBoundingClientRect();
            
            if (
                boxRect.left < appRect.right &&
                boxRect.right > appRect.left &&
                boxRect.top < appRect.bottom &&
                boxRect.bottom > appRect.top
            ) {
                appEl.classList.add('selected');
                selectedApps.add(appEl);
            } else {
                appEl.classList.remove('selected');
                selectedApps.delete(appEl);
            }
        });
    });
    
    window.addEventListener('mouseup', () => {
        if (isSelecting) {
            isSelecting = false;
            if (selectionBox) {
                selectionBox.remove();
                selectionBox = null;
            }
        }
    });

    function cancelSelection() {
        if (isSelecting) {
            isSelecting = false;
            if (selectionBox) {
                selectionBox.remove();
                selectionBox = null;
            }
        }
    }
    
    window.addEventListener('contextmenu', cancelSelection);
    window.addEventListener('mouseleave', cancelSelection);
}

function sendEmailViaMailto() {
    const emailAddress = "reimacdougall@gmail.com";
    const subject = document.getElementById('mail-subject').value;
    const body = document.getElementById('mail-body').value;
    const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    AMI.closeApp('mail');
}

function init() {
    resize();
    setupEventListeners();

    for (let i = 0; i < birdCount; i++) birds.push(new Bird());
    if(birdCounter) birdCounter.value = String(birdCount);
    updateBirdColors();

    let visibleIndex = 0;
    systemApps.forEach(({ n }) => {
        const appElement = document.getElementById(n);
        
        console.log("debug: ", n, appElement);
        
        if (appElement) {
            AMI.registerApp(appElement, n);
            dragElement(appElement);
            if (!appElement.classList.contains('hidden')) {
                AMI.centerWindow(n, visibleIndex);
                visibleIndex++;
            }
        }
    });

    renderWallpaperExplorer();

    if (loginBypass) hideLogin();

    window.BirbOSGateway = {
        loginBypass,
        hideLogin,
        showLoginError,
        openWelcomeWindow: () => AMI.openApp('welcome'),
        openSettingsWindow: () => AMI.openApp('settings')
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

init();