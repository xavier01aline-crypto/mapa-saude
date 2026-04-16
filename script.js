let agendaAtual = 'agenda1';
const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function showPage(p) {
    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-btn'));
    document.getElementById('btn-'+p).classList.add('active-btn');
}

function iniciarSeletores() {
    const mesSel = document.getElementById('selectMes');
    const anoSel = document.getElementById('selectAno');
    const d = new Date();
    mesesNomes.forEach((m, i) => {
        let o = new Option(m, i);
        if(i === d.getMonth()) o.selected = true;
        mesSel.add(o);
    });
    for(let a = d.getFullYear(); a <= d.getFullYear()+1; a++) {
        anoSel.add(new Option(a, a));
    }
}

function selecionarAgenda(id, btn) {
    agendaAtual = id;
    document.querySelectorAll('.agenda-selector-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    carregarAgendaSalva();
}

function gerarGrade() {
    const slot = parseInt(document.getElementById('slotTempo').value) || 20;
    const container = document.getElementById('gradeSemanal');
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    
    let html = `<table class="grade-table"><thead><tr><th>Hora</th>`;
    dias.forEach(d => html += `<th>${d}</th>`);
    html += `</tr></thead><tbody>`;
    
    for (let min = 360; min < 1380; min += slot) {
        let h = Math.floor(min / 60).toString().padStart(2, '0');
        let m = (min % 60).toString().padStart(2, '0');
        html += `<tr><td><strong>${h}:${m}</strong></td>`;
        for (let dia = 0; dia < 7; dia++) {
            const idU = `s-${min}-${dia}`;
            html += `<td>
                <select id="${idU}-sel" class="select-status" data-min="${min}" data-dia="${dia}" onchange="atualizarEstilo(this)">
                    <option value="eletivo">Eletivo</option>
                    <option value="internado">Internado</option>
                    <option value="ps">P.S</option>
                    <option value="especifico">Específico</option>
                    <option value="bloqueio">Bloqueado</option>
                    <option value="respiro">Respiro</option>
                    <option value="manutencao">Manutenção</option>
                </select>
                <input id="${idU}-obs" class="input-obs" placeholder="Obs..." style="width:100%; font-size:0.6rem; border:none; border-bottom:1px solid #ddd; background:transparent;">
            </td>`;
        }
        html += `</tr>`;
    }
    container.innerHTML = html + `</tbody></table>`;
    document.getElementById('display-detalhe').innerText = mesesNomes[document.getElementById('selectMes').value] + " / " + document.getElementById('selectAno').value;
    calcularProdutividade();
}

function aplicarEmMassa() {
    const dia = document.getElementById('bulkDay').value;
    const st = document.getElementById('bulkStart').value.split(':');
    const en = document.getElementById('bulkEnd').value.split(':');
    const status = document.getElementById('bulkStatus').value;
    const mSt = parseInt(st[0])*60 + parseInt(st[1]);
    const mEn = parseInt(en[0])*60 + parseInt(en[1]);

    document.querySelectorAll('.select-status').forEach(sel => {
        const sM = parseInt(sel.dataset.min);
        const sD = sel.dataset.dia;
        if((dia === 'all' || dia === sD) && (sM >= mSt && sM < mEn)) {
            sel.value = status;
            sel.className = 'select-status status-' + status;
        }
    });
    calcularProdutividade();
}

function atualizarEstilo(sel) {
    sel.className = 'select-status status-' + sel.value;
    calcularProdutividade();
}

function calcularProdutividade() {
    const mes = parseInt(document.getElementById('selectMes').value);
    const ano = parseInt(document.getElementById('selectAno').value);
    const diasMes = new Date(ano, mes + 1, 0).getDate();
    const fator = diasMes / 7;

    let el = 0, ur = 0, ma = 0, re = 0;
    document.querySelectorAll('.select-status').forEach(s => {
        if(s.value === 'eletivo' || s.value === 'especifico') el++;
        if(s.value === 'internado' || s.value === 'ps') ur++;
        if(s.value === 'manutencao') ma++;
        if(s.value === 'respiro') re++;
    });

    document.getElementById('kpiExames').innerText = Math.round(el * fator);
    document.getElementById('kpiUrgencia').innerText = Math.round(ur * fator);
    document.getElementById('kpiManutencao').innerText = Math.round(ma * fator);
    document.getElementById('kpiRespiros').innerText = Math.round(re * fator);
}

function salvarAgenda() {
    const mes = document.getElementById('selectMes').value;
    const ano = document.getElementById('selectAno').value;
    const key = `vc52_${agendaAtual}_${mes}_${ano}`;
    const dados = { titulo: document.getElementById('renameAgenda').value, slot: document.getElementById('slotTempo').value, mapa: [] };
    document.querySelectorAll('.select-status').forEach(s => {
        dados.mapa.push({ id: s.id, st: s.value, obs: document.getElementById(s.id.replace('-sel','-obs')).value });
    });
    localStorage.setItem(key, JSON.stringify(dados));
    alert("Salvo!");
}

function carregarAgendaSalva() {
    const mes = document.getElementById('selectMes').value;
    const ano = document.getElementById('selectAno').value;
    const salvo = localStorage.getItem(`vc52_${agendaAtual}_${mes}_${ano}`);
    gerarGrade();
    if(salvo) {
        const d = JSON.parse(salvo);
        document.getElementById('renameAgenda').value = d.titulo || "";
        document.getElementById('slotTempo').value = d.slot;
        gerarGrade();
        d.mapa.forEach(item => {
            const s = document.getElementById(item.id);
            if(s) {
                s.value = item.st;
                s.className = 'select-status status-' + item.st;
                document.getElementById(item.id.replace('-sel','-obs')).value = item.obs || "";
            }
        });
    }
    calcularProdutividade();
}

function exportarImagem() {
    html2canvas(document.getElementById('capture-area')).then(c => {
        const l = document.createElement('a');
        l.download = (document.getElementById('renameAgenda').value || 'agenda') + '.png';
        l.href = c.toDataURL();
        l.click();
    });
}

window.onload = () => { iniciarSeletores(); carregarAgendaSalva(); };
