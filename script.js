let currentAg = 'ag1';
const monthsN = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function showPage(p) {
    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-btn'));
    const btn = document.getElementById('btn-' + p);
    if (btn) btn.classList.add('active-btn');
    if (p === 'agendas') carregarAg();
}

function openModal(t, txt) {
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-text').innerHTML = txt;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

function filtrar(contexto) {
    const term = document.getElementById(contexto === 'diagnostica' ? 'searchDiag' : 'searchInter').value.toLowerCase();
    const grid = document.getElementById(contexto === 'diagnostica' ? 'grid-diagnostica' : 'grid-intervencionista');
    const buttons = grid.querySelectorAll('button');
    buttons.forEach(b => b.style.display = b.innerText.toLowerCase().includes(term) ? "block" : "none");
}

// Lógica de Agenda Hospitalar
function initSystem() {
    const m = document.getElementById('selMes');
    const a = document.getElementById('selAno');
    if (!m) return;
    const d = new Date();
    monthsN.forEach((name, i) => m.add(new Option(name, i)));
    for (let i = d.getFullYear(); i <= d.getFullYear() + 2; i++) a.add(new Option(i, i));
    m.value = d.getMonth();

    const tabs = document.getElementById('tabsAgendas');
    for (let i = 1; i <= 9; i++) {
        let b = document.createElement('button');
        b.className = `tab-link ${i === 1 ? 'active' : ''}`;
        b.innerText = `Agenda 0${i}`;
        b.onclick = function() { selectAg(`ag${i}`, this); };
        tabs.appendChild(b);
    }
}

function selectAg(id, btn) {
    currentAg = id;
    document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    carregarAg();
}

function gerarGradeAg() {
    const slot = parseInt(document.getElementById('slotMin').value) || 20;
    const container = document.getElementById('gradeDiv');
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let html = `<table class="grade-table"><thead><tr><th>Hora</th>`;
    dias.forEach(d => html += `<th>${d}</th>`);
    html += `</tr></thead><tbody>`;

    for (let min = 360; min < 1380; min += slot) {
        let h = Math.floor(min / 60).toString().padStart(2, '0');
        let m = (min % 60).toString().padStart(2, '0');
        html += `<tr><td style="background:#f8fafc; font-weight:700;">${h}:${m}</td>`;
        for (let d = 0; d < 7; d++) {
            const id = `s-${min}-${d}`;
            html += `<td><select class="s-inp" id="${id}" onchange="calcAg()"><option value="ex">Eletivo</option><option value="ma">Manut.</option></select></td>`;
        }
        html += `</tr>`;
    }
    container.innerHTML = html + `</tbody></table>`;
    calcAg();
}

function calcAg() {
    const sels = document.querySelectorAll('.s-inp');
    let ex = 0, ma = 0;
    sels.forEach(s => {
        s.style.backgroundColor = s.value === 'ma' ? '#fee2e2' : '#dcfce7';
        if(s.value === 'ex') ex++; else ma++;
    });
    const diasMes = new Date(document.getElementById('selAno').value, parseInt(document.getElementById('selMes').value)+1, 0).getDate();
    const fator = diasMes / 7;
    document.getElementById('valEx').innerText = Math.round(ex * fator);
    document.getElementById('valMa').innerText = Math.round(ma * fator);
}

function salvarAg() {
    const key = `vc61_${currentAg}_${document.getElementById('selMes').value}_${document.getElementById('selAno').value}`;
    const dados = { nome: document.getElementById('renameAg').value, slot: document.getElementById('slotMin').value, mapa: [] };
    document.querySelectorAll('.s-inp').forEach(s => dados.mapa.push({ id: s.id, v: s.value }));
    localStorage.setItem(key, JSON.stringify(dados));
    alert("Gravado!");
}

function carregarAg() {
    const key = `vc61_${currentAg}_${document.getElementById('selMes').value}_${document.getElementById('selAno').value}`;
    const salvo = localStorage.getItem(key);
    gerarGradeAg();
    if (salvo) {
        const d = JSON.parse(salvo);
        document.getElementById('renameAg').value = d.nome || "";
        document.getElementById('slotMin').value = d.slot || 20;
        gerarGradeAg(); // Re-gera com o slot correto
        d.mapa.forEach(item => {
            const s = document.getElementById(item.id);
            if(s) s.value = item.v;
        });
    } else {
        document.getElementById('renameAg').value = "";
    }
    document.getElementById('capTit').innerText = document.getElementById('renameAg').value || "Agenda";
    document.getElementById('capPeriodo').innerText = monthsN[document.getElementById('selMes').value] + " / " + document.getElementById('selAno').value;
    calcAg();
}

function exportarAg() {
    html2canvas(document.getElementById('areaCaptura')).then(canvas => {
        const link = document.createElement('a');
        link.download = `Agenda_${currentAg}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

window.onload = initSystem;
