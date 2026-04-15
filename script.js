function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active-btn'));
    const activeBtn = document.getElementById('btn-' + pageId);
    if (activeBtn) activeBtn.classList.add('active-btn');
    document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
}

function openModal(title, text) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-text').innerHTML = text;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

window.onclick = function(event) {
    if (event.target == document.getElementById('modal')) closeModal();
}

// LÓGICA DE GRADE v5.1
function gerarGrade() {
    const slot = parseInt(document.getElementById('slotTempo').value) || 20;
    const container = document.getElementById('gradeSemanal');
    let html = `<table class="grade-table"><thead><tr><th>Hora</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th></tr></thead><tbody>`;
    
    for (let min = 360; min < 1380; min += slot) {
        let h = Math.floor(min / 60).toString().padStart(2, '0');
        let m = (min % 60).toString().padStart(2, '0');
        html += `<tr><td><strong>${h}:${m}</strong></td>`;
        for (let dia = 1; dia <= 5; dia++) {
            const idU = `s-${min}-${dia}`;
            html += `<td>
                <select id="${idU}-sel" class="select-status" data-min="${min}" data-dia="${dia}" onchange="atualizarEstilo(this)">
                    <option value="eletivo">Eletivo</option>
                    <option value="respiro">Respiro</option>
                    <option value="bloqueio">Bloqueio</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="especifico">Específico</option>
                </select>
                <input id="${idU}-obs" class="input-obs" placeholder="Obs...">
            </td>`;
        }
        html += `</tr>`;
    }
    container.innerHTML = html + `</tbody></table>`;
    atualizarEstiloTudo();
}

function atualizarEstilo(sel) {
    sel.className = 'select-status status-' + sel.value;
    calcularProdutividade();
}

function atualizarEstiloTudo() {
    document.querySelectorAll('.select-status').forEach(s => {
        s.className = 'select-status status-' + s.value;
    });
    calcularProdutividade();
}

function aplicarEmMassa() {
    const diaAlvo = document.getElementById('bulkDay').value;
    const start = document.getElementById('bulkStart').value.split(':');
    const end = document.getElementById('bulkEnd').value.split(':');
    const status = document.getElementById('bulkStatus').value;
    
    const minStart = parseInt(start[0]) * 60 + parseInt(start[1]);
    const minEnd = parseInt(end[0]) * 60 + parseInt(end[1]);

    document.querySelectorAll('.select-status').forEach(sel => {
        const selMin = parseInt(sel.dataset.min);
        const selDia = sel.dataset.dia;
        if ((diaAlvo === 'all' || diaAlvo === selDia) && (selMin >= minStart && selMin < minEnd)) {
            sel.value = status;
        }
    });
    atualizarEstiloTudo();
}

function salvarAgenda() {
    const key = document.getElementById('agendaSelect').value;
    const dados = {
        titulo: document.getElementById('renameAgenda').value,
        periodo: document.getElementById('agendaPeriodo').value,
        slot: document.getElementById('slotTempo').value,
        mapa: []
    };
    document.querySelectorAll('.select-status').forEach(s => {
        const obs = document.getElementById(s.id.replace('-sel', '-obs')).value;
        dados.mapa.push({ id: s.id, st: s.value, obs: obs });
    });
    localStorage.setItem('vc_v51_'+key, JSON.stringify(dados));
    document.getElementById('display-titulo').innerText = dados.titulo;
    document.getElementById('display-periodo').innerText = dados.periodo ? "Vigência: " + dados.periodo : "";
    alert("Parametrização Gravada!");
}

function carregarAgendaSalva() {
    const key = document.getElementById('agendaSelect').value;
    const salvo = localStorage.getItem('vc_v51_'+key);
    if (salvo) {
        const d = JSON.parse(salvo);
        document.getElementById('renameAgenda').value = d.titulo || "";
        document.getElementById('agendaPeriodo').value = d.periodo || "";
        document.getElementById('slotTempo').value = d.slot;
        gerarGrade();
        d.mapa.forEach(item => {
            const sel = document.getElementById(item.id);
            const obs = document.getElementById(item.id.replace('-sel', '-obs'));
            if (sel) { sel.value = item.st; if (obs) obs.value = item.obs || ""; }
        });
        document.getElementById('display-titulo').innerText = d.titulo;
        document.getElementById('display-periodo').innerText = d.periodo ? "Vigência: " + d.periodo : "";
    } else {
        gerarGrade();
    }
    atualizarEstiloTudo();
}

function calcularProdutividade() {
    const selects = document.querySelectorAll('.select-status');
    let ex = 0, ma = 0, re = 0;
    selects.forEach(s => {
        if (s.value === 'eletivo' || s.value === 'especifico') ex++;
        if (s.value === 'manutencao') ma++;
        if (s.value === 'respiro' || s.value === 'bloqueio') re++;
    });
    document.getElementById('kpiExames').innerText = ex;
    document.getElementById('kpiManutencao').innerText = ma;
    document.getElementById('kpiRespiros').innerText = re;
}

function exportarImagem() {
    html2canvas(document.getElementById('capture-area')).then(canvas => {
        const link = document.createElement('a');
        link.download = (document.getElementById('renameAgenda').value || 'agenda') + '.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

window.onload = () => carregarAgendaSalva();
