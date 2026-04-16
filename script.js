let agendaAtiva = 'ag1';
const mesesExtenso = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// Navegação
function showPage(p) {
    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-btn'));
    const btn = document.getElementById('btn-' + p);
    if (btn) btn.classList.add('active-btn');
    if (p === 'agendas') carregarDadosAgenda();
}

// Modal
function openModal(t, txt) {
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-text').innerHTML = txt;
    document.getElementById('modal').style.display = 'block';
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }

// Busca
function filtrar(contexto) {
    let input = contexto === 'diagnostica' ? 'searchDiag' : 'searchInter';
    let term = document.getElementById(input).value.toLowerCase();
    let grid = contexto === 'diagnostica' ? 'grid-diagnostica' : 'grid-intervencionista';
    let buttons = document.querySelectorAll(`#${grid} button`);

    buttons.forEach(btn => {
        btn.style.display = btn.innerText.toLowerCase().includes(term) ? "block" : "none";
    });
}

// Lógica de Agendas
function iniciarParametros() {
    const mesS = document.getElementById('selectMes');
    const anoS = document.getElementById('selectAno');
    const d = new Date();
    
    mesesExtenso.forEach((m, i) => mesS.add(new Option(m, i)));
    for (let a = d.getFullYear(); a <= d.getFullYear() + 2; a++) anoS.add(new Option(a, a));
    
    mesS.value = d.getMonth();
    
    const tabs = document.getElementById('agendaSubmenu');
    for (let i = 1; i <= 9; i++) {
        let b = document.createElement('button');
        b.className = `tab-btn ${i === 1 ? 'active' : ''}`;
        b.innerText = `Agenda 0${i}`;
        b.onclick = function() { selecionarAgenda(`ag${i}`, this); };
        tabs.appendChild(b);
    }
}

function selecionarAgenda(id, btn) {
    agendaAtiva = id;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    carregarDadosAgenda();
}

function gerarGradeAgendas() {
    const slot = parseInt(document.getElementById('slotTempo').value) || 20;
    const container = document.getElementById('gradeDinâmica');
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    let html = `<table class="grade-table"><thead><tr><th>Hora</th>`;
    dias.forEach(d => html += `<th>${d}</th>`);
    html += `</tr></thead><tbody>`;

    for (let min = 360; min < 1380; min += slot) {
        let h = Math.floor(min / 60).toString().padStart(2, '0');
        let m = (min % 60).toString().padStart(2, '0');
        html += `<tr><td><strong>${h}:${m}</strong></td>`;
        for (let d = 0; d < 7; d++) {
            const idU = `s-${min}-${d}`;
            html += `<td>
                <select id="${idU}" class="s-st" data-min="${min}" data-dia="${d}" onchange="calcKPI()">
                    <option value="eletivo">Eletivo</option>
                    <option value="internado">Internado</option>
                    <option value="ps">PS</option>
                    <option value="bloqueio">Bloq.</option>
                    <option value="respiro">Resp.</option>
                    <option value="manutencao">Manut.</option>
                </select>
            </td>`;
        }
        html += `</tr>`;
    }
    container.innerHTML = html + `</tbody></table>`;
    calcKPI();
}

function aplicarConfigMassa() {
    const dia = document.getElementById('bulkDia').value;
    const ini = document.getElementById('bulkInicio').value.split(':');
    const fim = document.getElementById('bulkFim').value.split(':');
    const st = document.getElementById('bulkStatus').value;
    
    const mIni = parseInt(ini[0]) * 60 + parseInt(ini[1]);
    const mFim = parseInt(fim[0]) * 60 + parseInt(fim[1]);

    document.querySelectorAll('.s-st').forEach(sel => {
        const sM = parseInt(sel.dataset.min);
        const sD = sel.dataset.dia;
        if ((dia === 'all' || dia == sD) && (sM >= mIni && sM < mFim)) {
            sel.value = st;
        }
    });
    calcKPI();
}

function calcKPI() {
    const selects = document.querySelectorAll('.s-st');
    let el = 0, ur = 0, ma = 0, re = 0, bl = 0;
    
    selects.forEach(s => {
        s.className = 's-st status-' + s.value;
        if (s.value === 'eletivo') el++;
        if (s.value === 'internado' || s.value === 'ps') ur++;
        if (s.value === 'manutencao') ma++;
        if (s.value === 'respiro') re++;
        if (s.value === 'bloqueio') bl++;
    });

    const fator = 4; // Mensal estimado
    document.getElementById('valExames').innerText = el * fator;
    document.getElementById('valUrgencia').innerText = ur * fator;
    document.getElementById('valManut').innerText = ma * fator;
    document.getElementById('valRespiro').innerText = re * fator;
    document.getElementById('valBloq').innerText = bl * fator;
}

function salvarConfigMês() {
    const mes = document.getElementById('selectMes').value;
    const ano = document.getElementById('selectAno').value;
    const iden = document.getElementById('agendaRename').value;
    const key = `vc60_${agendaAtiva}_${mes}_${ano}`;
    
    const dados = {
        nome: iden,
        slot: document.getElementById('slotTempo').value,
        mapa: []
    };
    
    document.querySelectorAll('.s-st').forEach(s => dados.mapa.push({ id: s.id, v: s.value }));
    localStorage.setItem(key, JSON.stringify(dados));
    alert("Dados gravados com sucesso!");
}

function carregarDadosAgenda() {
    const mes = document.getElementById('selectMes').value;
    const ano = document.getElementById('selectAno').value;
    const key = `vc60_${agendaAtiva}_${mes}_${ano}`;
    const salvo = localStorage.getItem(key);
    
    gerarGradeAgendas();
    
    if (salvo) {
        const d = JSON.parse(salvo);
        document.getElementById('agendaRename').value = d.nome || "";
        document.getElementById('slotTempo').value = d.slot || 20;
        d.mapa.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) el.value = item.v;
        });
    } else {
        document.getElementById('agendaRename').value = "";
    }
    document.getElementById('displayMesAno').innerText = `${mesesExtenso[mes]} / ${ano}`;
    calcKPI();
}

function exportarAgendaPNG() {
    html2canvas(document.getElementById('areaCaptura')).then(canvas => {
        const link = document.createElement('a');
        link.download = `Agenda_${agendaAtiva}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

window.onload = () => iniciarParametros();
