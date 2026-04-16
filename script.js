let curAg = 'ag1';
const monthsNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function showPage(p) {
    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-btn'));
    const btn = document.getElementById('btn-' + p);
    if (btn) btn.classList.add('active-btn');
    if (p === 'agendas') carregarAg();
}

function filtrar(inp, gridId) {
    const t = inp.value.toLowerCase();
    const cards = document.querySelectorAll(`#${gridId} .card-p`);
    cards.forEach(card => {
        const btns = card.querySelectorAll('button');
        let cardMatch = false;
        btns.forEach(b => {
            if(b.innerText.toLowerCase().includes(t)) {
                b.style.display = "block";
                cardMatch = true;
            } else {
                b.style.display = "none";
            }
        });
        card.style.display = cardMatch ? "block" : "none";
    });
}

// AGENDA MOTOR
function initParams() {
    const m = document.getElementById('selMes');
    const a = document.getElementById('selAno');
    if (!m) return;
    const d = new Date();
    monthsNames.forEach((name, i) => m.add(new Option(name, i)));
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
    curAg = id;
    document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    carregarAg();
}

function forcarGrade() { gerarGradeAg(); }

function gerarGradeAg() {
    const slot = parseInt(document.getElementById('slotMin').value) || 20;
    const cont = document.getElementById('gradeDiv');
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
            html += `<td>
                <select class="s-inp" id="${id}" onchange="toggleE(this)">
                    <option value="eletivo">Eletivo</option>
                    <option value="ps">P.S.</option>
                    <option value="internado">Internado</option>
                    <option value="ma">Manut.</option>
                    <option value="respiro">Respiro</option>
                    <option value="bloqueio">Bloqueio</option>
                    <option value="especifico">Específico</option>
                </select>
                <input type="text" id="${id}-tx" class="input-especifico-tx" placeholder="...">
            </td>`;
        }
        html += `</tr>`;
    }
    cont.innerHTML = html + `</tbody></table>`;
    calcAg();
}

function toggleE(sel) {
    const tx = document.getElementById(sel.id + "-tx");
    tx.style.display = sel.value === 'especifico' ? "block" : "none";
    calcAg();
}

function calcAg() {
    const sels = document.querySelectorAll('.s-inp');
    let el = 0, esp = 0, ur = 0, ma = 0, re = 0, bl = 0;
    sels.forEach(s => {
        if(s.value === 'eletivo') el++;
        if(s.value === 'especifico') esp++;
        if(s.value === 'ps' || s.value === 'internado') ur++;
        if(s.value === 'ma') ma++;
        if(s.value === 'respiro') re++;
        if(s.value === 'bloqueio') bl++;
    });
    const f = 4.3;
    document.getElementById('valElEsp').innerText = Math.round((el + esp) * f);
    document.getElementById('valUr').innerText = Math.round(ur * f);
    document.getElementById('valMa').innerText = Math.round(ma * f);
    document.getElementById('valRe').innerText = Math.round(re * f);
    document.getElementById('valTotal').innerText = Math.round(sels.length * f);
}

function salvarAg() {
    const mes = document.getElementById('selMes').value;
    const ano = document.getElementById('selAno').value;
    const key = `v12_${curAg}_${mes}_${ano}`;
    const d = { nome: document.getElementById('renameAg').value, slot: document.getElementById('slotMin').value, mapa: [] };
    document.querySelectorAll('.s-inp').forEach(s => {
        d.mapa.push({ id: s.id, v: s.value, t: document.getElementById(s.id + "-tx").value });
    });
    localStorage.setItem(key, JSON.stringify(d));
    alert("Dados Salvos!");
}

function carregarAg() {
    const mes = document.getElementById('selMes').value;
    const ano = document.getElementById('selAno').value;
    const key = `v12_${curAg}_${mes}_${ano}`;
    const s = localStorage.getItem(key);
    gerarGradeAg();
    if(s) {
        const d = JSON.parse(s);
        document.getElementById('renameAg').value = d.nome || "";
        document.getElementById('slotMin').value = d.slot || 20;
        if(d.slot != 20) gerarGradeAg();
        d.mapa.forEach(item => {
            const el = document.getElementById(item.id);
            if(el) {
                el.value = item.v;
                const tx = document.getElementById(item.id + "-tx");
                if(tx) { tx.value = item.t || ""; if(item.v === 'especifico') tx.style.display = "block"; }
            }
        });
    }
    document.getElementById('capTit').innerText = document.getElementById('renameAg').value || "Agenda";
    document.getElementById('capPeriodo').innerText = monthsNames[mes] + " / " + ano;
    calcAg();
}

function aplicarMassa() {
    const st = document.getElementById('bulkStatus').value;
    document.querySelectorAll('.s-inp').forEach(s => { s.value = st; toggleE(s); });
    calcAg();
}

function openModal(t, txt) {
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-text').innerHTML = txt;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

window.onload = initParams;
