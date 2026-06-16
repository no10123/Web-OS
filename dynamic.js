const viewport = document.getElementById("viewport");

let AP = '<div class="apps-panel" id="apps">\n';
let W  = '<div id="windows">\n';

const systemApps = [
    { n: 'welcome',    i: 'fa-file-lines',       t: 'welcome msg' },
    { n: 'txtEditor',  i: 'fa-file-lines',       t: 'text editor' },
    { n: 'codeEditor', i: 'fa-file-lines',       t: 'code editor' },
    { n: 'calculator', i: 'fa-calculator',       t: 'calculator' },
    { n: 'browser',    i: 'fa-brands fa-chrome', t: 'web browser' },
    { n: 'addApp',     i: 'fa-envelope',         t: 'add app' },
    { n: 'settings',   i: 'fa-gear',             t: 'settings' },
    { n: 'mail',       i: 'fa-envelope',         t: 'hire me!' }
];

// add template ids
systemApps.forEach(app => {
    app.c = `t-${app.n}`;
});

function CreateApp(n, i, t) {

    AP += `
        <button class="app-launcher" type="button" onclick="AMI.openApp('${n}')" id="App-${n}">
            <i class="fa-solid ${i} fa-2x appName app-icon-margin"></i>
            <span class="appName">${t}</span>
        </button>
    `;

    W += `
        <div id="${n}" class="dragable hidden">
            <div class="drag">
                <i class="fa-solid ${i}"></i>
                <span class="wTitle">${t}</span>

                <div class="window-controls">
                    <button type="button" onclick="AMI.minApp('${n}')">−</button>
                    <button type="button" onclick="AMI.toggleFullscreen('${n}')">□</button>
                    <button type="button" onclick="AMI.closeApp('${n}')">×</button>
                </div>
            </div>
            <div class="text frosted-glass flex-col-window" id="${n}-Window"></div>
        </div>`;
}

systemApps.forEach(({ n, i, t }) => {
    CreateApp(n, i, t);
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