const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const loginBypass = new URLSearchParams(window.location.search).get('login') === 'true';
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const osTarget = 'index.html?login=true';
const veiwport = document.getElementById("veiwport");
const apps = document.getElementById("apps");
const wm = document.getElementById("welcome-msg")
const wmHeader = document.getElementById('welcome-msgheader');
const settingsWin = document.getElementById("settings");
const settingsHeader = document.getElementById('settingsheader');
const colorPicker = document.getElementById('colorPicker');
const birdCounter = document.getElementById('bird-count');
const birdColorCountInput = document.getElementById('bird-color-count');
const birdColorsContainer = document.getElementById('bird-colors-container');
const blobLayer = document.querySelector('.blob-layer');
const timeText = document.getElementById("timeElement");
let currentTime = new Date().toLocaleString();
let openWindows = [];
timeText.textContent = `Time: ${currentTime}`
function updateTime() {
    currentTime = new Date().toLocaleString();
    timeText.textContent = `Time: ${currentTime}`
};
setInterval(updateTime, 1000);

let width;
let height;
let mouseX = -1000;
let mouseY = -1000;
let isMouseDown = false;
let birds = [];
let welcomeIsFullscreen = false;
let settingsIsFullscreen = false;
let birdCount = 75;
const defaultBirdColors = ['#b4befe', '#cba6f7', '#cdd6f4'];
let birdColors = [...defaultBirdColors];

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
    if (!wm.classList.contains('hidden') && !welcomeIsFullscreen) {
        centerWelcomeWindow();
    }
    if (!settingsWin.classList.contains('hidden') && !settingsIsFullscreen) {
        centerSettingsWindow();
    }
}

function getWindowBounds(elmnt) {
    const viewportRect = veiwport.getBoundingClientRect();
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

function centerWelcomeWindow() {
    centerWindow(wm);
}

function centerSettingsWindow() {
    centerWindow(settingsWin);
}

function openWelcomeWindow() {
    wm.classList.remove('hidden');
    welcomeIsFullscreen = false;
    wm.classList.remove('fullscreen');
    wm.style.width = '';
    wm.style.height = '';
    centerWelcomeWindow();
}

function closeWelcomeWindow() {
    wm.classList.add('hidden');
    welcomeIsFullscreen = false;
    wm.classList.remove('fullscreen');
}

function minimizeWelcomeWindow() {
    wm.classList.add('hidden');
    welcomeIsFullscreen = false;
    wm.classList.remove('fullscreen');
}

function toggleWelcomeFullscreen() {
    if (wm.classList.contains('hidden')) return;

    welcomeIsFullscreen = !welcomeIsFullscreen;
    wm.classList.toggle('fullscreen', welcomeIsFullscreen);

    if (welcomeIsFullscreen) {
        wm.style.left = '0px';
        wm.style.top = '0px';
        wm.style.width = '100%';
        wm.style.height = '100%';
    } else {
        wm.style.width = '';
        wm.style.height = '';
        centerWelcomeWindow();
    }
}

function openSettingsWindow() {
    settingsWin.classList.remove('hidden');
    settingsIsFullscreen = false;
    settingsWin.classList.remove('fullscreen');
    settingsWin.style.width = '';
    settingsWin.style.height = '';
    centerSettingsWindow();
}

function closeSettingsWindow() {
    settingsWin.classList.add('hidden');
    settingsIsFullscreen = false;
    settingsWin.classList.remove('fullscreen');
}

function minimizeSettingsWindow() {
    settingsWin.classList.add('hidden');
    settingsIsFullscreen = false;
    settingsWin.classList.remove('fullscreen');
}

function toggleSettingsFullscreen() {
    if (settingsWin.classList.contains('hidden')) return;

    settingsIsFullscreen = !settingsIsFullscreen;
    settingsWin.classList.toggle('fullscreen', settingsIsFullscreen);

    if (settingsIsFullscreen) {
        settingsWin.style.left = '0px';
        settingsWin.style.top = '0px';
        settingsWin.style.width = '100%';
        settingsWin.style.height = '100%';
    } else {
        settingsWin.style.width = '';
        settingsWin.style.height = '';
        centerSettingsWindow();
    }
}

//from w3 schools (slightly edited)
function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    const header = document.getElementById(elmnt.id + 'header');
    const dragHandle = header || elmnt;

    dragHandle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (elmnt.classList.contains('fullscreen')) {
            return;
        }

        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
        elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
        elmnt.style.transform = 'none';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function updateBirdColors() {
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
            birds.forEach(bird => {
                bird.updateColor();
            });
        });
        birdColorsContainer.appendChild(input);
    });

    birds.forEach(bird => {
        bird.updateColor();
    });
}

function setBirdColorCount(nextCount) {
    const targetCount = Math.max(1, Number(nextCount) || 1);

    while (birdColors.length < targetCount) {
        birdColors.push(defaultBirdColors[birdColors.length % defaultBirdColors.length]);
    }

    birdColors.length = targetCount;
    updateBirdColors();
}

async function clickButton(i) {
    if (i==1) {
        await navigator.clipboard.writeText("#a6e3a1")
        //alert("copeid!")
    } else if (i == 7) {
        birdCount += 1;
        birds.push(new Bird());
        birdCounter.value = String(birdCount);
    } else if (i == 8) {
        if (birds.length > 0) {
            birds.pop();
            birdCount = Math.max(0, birdCount - 1);
            birdCounter.value = String(birdCount);
        }
    } else if (i == 11) {
        setBirdColorCount(Math.min(birdColors.length + 1,8));
    } else if (i == 12) {
        setBirdColorCount(Math.max(birdColors.length - 1,1));
    }
}

function showLoginError(message) {
    loginError.textContent = message;
}

function hideLogin() {
    loginOverlay.classList.remove('active');
    loginOverlay.setAttribute('aria-hidden', 'true');
    loginError.textContent = '';
    loginForm.reset();
}

if (loginBypass) {
    hideLogin();
    loginOverlay.classList.remove('active');
    loginOverlay.setAttribute('aria-hidden', 'true');
}

window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

window.addEventListener('mousedown', () => isMouseDown = true);
window.addEventListener('mouseup', () => isMouseDown = false);
window.addEventListener('resize', resize);

resize();

function getCy(x, y) {
    const time = Date.now() * 0.0015;
    return Math.sin(time * 0.02) * 2 + Math.sin((x + y) * 0.002) * 0.75;
}

function getCx(x, y) {
    const time = Date.now() * 0.0015;
    return Math.cos(time * 0.02) * 2 + Math.sin((x - y) * 0.002) * 0.75;
}

class Bird {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() * 1.5) + 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.Vx = this.vx;
        this.Vy = this.vy;
        this.color = birdColors[Math.floor(Math.random() * birdColors.length)];
        this.size = Math.random() * 1.5 + 1;
        this.wingSpeed = (Math.random() * 0.01) + 0.005;
        this.wingOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.Vx = this.vx + getCx(this.x, this.y);
        this.Vy = this.vy + getCy(this.x, this.y);
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
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(-10, flap);
        ctx.lineTo(0, 0);
        ctx.lineTo(-10, -flap);
        ctx.stroke();
        ctx.restore();
    }

    updateColor() {
        this.color = birdColors[Math.floor(Math.random() * birdColors.length)];
    }
}

for (let index = 0; index < birdCount; index += 1) {
    birds.push(new Bird());
}
birdCounter.value = String(birdCount);
updateBirdColors();

if (!wm.classList.contains('hidden')) {
    centerWelcomeWindow();
}
dragElement(wm);
dragElement(settingsWin);

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

birdCounter.addEventListener('input', (event) => {
    const i = event.target.value - birdCount;
    if (i > 0) {
        for (let j = 0; j < i; j++) {
            clickButton(7);
        }
    } else if (i < 0) {
        for (let j = 0; j < Math.abs(i); j++) {
            clickButton(8);
        }
    }
});

birdColorCountInput.addEventListener('input', (event) => {
    setBirdColorCount(event.target.value);
});

function animateBirds() {
    ctx.clearRect(0, 0, width, height);

    birds.forEach((bird) => {
        bird.update();
        bird.draw();
    });

    requestAnimationFrame(animateBirds);
}

animateBirds();

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

window.BirbOSGateway = {
    loginBypass,
    hideLogin,
    showLoginError,
    openWelcomeWindow,
    openSettingsWindow,
};