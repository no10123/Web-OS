const viewport = document.getElementById("viewport"); 

//viewport.innerHTML = "";

let AP = '<div class="apps-panel" id="apps">\n';
let W  = '<div id="windows">\n';
 
const systemApps = [
    { n: 'welcome',    i: 'fa-file-lines',       t: 'welcome msg' },
    { n: 'txtEditor',  i: 'fa-file-lines',       t: 'text editor' },
    { n: 'codeEditor', i: 'fa-file-lines',       t: 'code editor' },
    { n: 'calculator', i: 'fa-calculator',       t: 'calculator'  },
    { n: 'browser',    i: 'fa-brands fa-chrome', t: 'web browser' },
    { n: 'addApp',     i: 'fa-envelope',         t: 'add app'     },
    { n: 'settings',   i: 'fa-gear',             t: 'settings'    },
    { n: 'mail',       i: 'fa-envelope',         t: 'hire me!',   }
];

let j = 0;
systemApps.forEach(({n}) => {
    systemApps[j] = {...systemApps[j], c: `t-${n}`}
    j++;
});

function CreateApp (n, i, t, c) {
    AP += `<button class="app-launcher" type="button" onclick="AMI.openApp('${n}')">\n`
    AP += `    <i class="fa-solid ${i} fa-2x appName app-icon-margin"></i>\n`
    AP += `    <span class="appName">${t}</span>\n`
    AP += `</button>\n`

    W += `<div id="${n}" class="dragable hidden">\n`
    W += `<div class="drag" id="${n}-header">\n`
    W += `<i class="fa-solid ${i}"></i>\n`
    W += `<span class="wTitle">${t}</span>`

    W += `<div class="window-controls">`
    W += `<button type="button" onclick="AMI.minApp('${n}')">-</button>`
    W += `<button type="button" onclick="AMI.toggleFullscreen('${n}')">[]</button>`
    W += `<button type="button" onclick="AMI.closeApp('${n}')">x</button>`
    W += `</div>\n`
    W += `</div>\n`

    W += `<div class="text frosted-glass flex-col-window" id="${n}-Window">`
    W += `</div>`
};

systemApps.forEach(({ n, i, t, c }) => {
    CreateApp(n, i, t, c); // i do it this way so i i can add apps dynamically
});

viewport.innerHTML = AP + '</div>' + W + '</div>';

systemApps.forEach(({ n, c}) => {
    const Element = document.getElementById(`t-${n}`);
    const destination = document.getElementById(`${n}-Window`);

    if (Element && destination) {
        destination.appendChild(Element.content.cloneNode(true));
    };
});
/*
const systemApps = [
    { e: wm,            n: 'welcome',    i: 'fa-file-lines',       t: ''},
    { e: txtEditorWin,  n: 'txtEditor',  i: 'fa-file-lines',       t: ''},
    { e: codeEditorWin, n: 'codeEditor', i: 'fa-file-lines',       t: ''},
    { e: calculatorWin, n: 'calculator', i: 'fa-calculator',       t: ''},
    { e: browserWin,    n: 'browser',    i: 'fa-brands fa-chrome', t: ''},
    { e: addApp,        n: 'browser',    i: 'fa-envalope',         t: ''},
    { e: settingsWin,   n: 'settings',   i: 'fa-gear',             t: ''},
    { e: mailWindow,    n: 'mail',       i: 'fa-envalope',         t: ''}
];
 */