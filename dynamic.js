const viewport = document.getElementById("viewport");

let AP = '<div class="apps-panel" id="apps">\n';
let W  = '<div id="windows">\n';

// name, icon, title, window.width, window.height 
const systemApps = [
    { n: 'welcome',    i: 'fa-file-lines',       t: 'welcome msg', w: 600,  h: 400, f: false },
    { n: 'txtEditor',  i: 'fa-file-lines',       t: 'text editor', w: 700,  h: 500, f: true  },
    { n: 'codeEditor', i: 'fa-file-lines',       t: 'code editor', w: 900,  h: 650, f: true  },
    { n: 'calculator', i: 'fa-calculator',       t: 'calculator',  w: 340,  h: 8000, f: false },
    { n: 'browser',    i: 'fa-brands fa-chrome', t: 'web browser', w: 1100, h: 700, f: true  },
    { n: 'clock',      i: 'fa-clock',            t: 'clock',       w: 900,  h: 650, f: false },
    { n: 'addApp',     i: 'fa-envelope',         t: 'add app',     w: 500,  h: 300, f: false },
    { n: 'settings',   i: 'fa-gear',             t: 'settings',    w: 900,  h: 700, f: true  },
    { n: 'mail',       i: 'fa-envelope',         t: 'hire me!',    w: 600,  h: 500, f: false }
];

// add template ids
systemApps.forEach(app => {
    app.c = `t-${app.n}`;
});

function CreateApp(n, i, t, w = 600, h = 450) {

    AP += `
        <button class="app-launcher" type="button" onclick="AMI.openApp('${n}')" id="App-${n}">
            <i class="fa-solid ${i} fa-2x appName app-icon-margin"></i>
            <span class="appName">${t}</span>
        </button>
    `;

    W += `
        <div id="${n}" class="dragable hidden" style="width:${w}px;height:${h}px;">
            <div class="drag">
                <i class="fa-solid ${i}"></i>
                <span class="wTitle">${t}</span>

                <div class="window-controls">
                    <button type="button" onclick="AMI.minApp('${n}')">−</button>
                    <button type="button" onclick="AMI.toggleFullscreen('${n}')">□</button>
                    <button type="button" onclick="AMI.closeApp('${n}')">×</button>
                </div>
            </div>
            <div class="text frosted-glass-large flex-col-window" id="${n}-Window"></div>
        </div>`;
}

systemApps.forEach(({ n, i, t, w, h }) => {
    CreateApp(n, i, t, w, h );
});

viewport.innerHTML = `
    ${AP}
    </div>

    ${W}
    </div>
`;

// populate window contents
systemApps.forEach(({ n }) => {

    const template = document.getElementById(`t-${n}`);
    const destination = document.getElementById(`${n}-Window`);

    if (!template || !destination) return;

    destination.appendChild(
        template.content.cloneNode(true)
    );
});