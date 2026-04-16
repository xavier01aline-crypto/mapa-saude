let currentAg = 'ag1';
const monthsExt = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function showPage(p) {
    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('btn-' + p);
    if (btn) btn.classList.add('active');
    if (p === 'agendas') carregarAg();
}

function filtrarCards(input, gridId) {
    const t = input.value.toLowerCase();
    const cards = document.querySelectorAll(`#${gridId} .card-unit`);
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

// INICIALIZAÇÃO E ENGINE DA AGENDA
function init() {
    const m = document.getElementById('selMes');
    const a = document.getElementById('selAno');
    if (!m) return;
    const d = new Date();
    monthsExt.forEach((name, i) => m.add(new Option(name, i)));
    for (let i = d.getFullYear(); i <= d.getFullYear() + 2; i++) a.add(new Option(i, i));
    m.value = d.getMonth();

    const tabs = document.getElementById('tabsAgendas');
    for (let i = 1; i <= 9; i++) {
        let b = document.createElement('button');
        b.className = `tab-link-ag ${i === 1 ? 'active' : ''}`;
        b.innerText = `Agenda 0${i}`;
        b.onclick = function() { selectAg(`ag${i}`, this); };
        tabs.appendChild(b);
    }
}

function selectAg(id, btn) {
    currentAg = id;
    document.querySelectorAll('.tab-link-ag').forEach(b => b.classList.remove('active'));
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
                <select class="s-inp" id="${id}" onchange="calcAg()">
                    <option value="ex">Eletivo</option>
                    <option value="ps">P.S.</option>
                    <option value="in">Internado</option>
                    <option value="ma">Manut.</option>
                    <option value="re">Respiro</option>
                    <option value="bl">Bloqueio</option>
                    <option value="es">Específico</option>
                </select>
                <input type="text" id="${id}-tx" style="width:100%; display:none; font-size:10px;" placeholder="...">
            </td>`;
        }
        html += `</tr>`;
    }
    cont.innerHTML = html + `</tbody></table>`;
    
    // Adicionar listener para inputs específicos
    document.querySelectorAll('.s-inp').forEach(s => {
        s.addEventListener('change', function() {
            const tx = document.getElementById(this.id + '-tx');
            tx.style.display = this.value === 'es' ? 'block' : 'none';
        });
    });
    calcAg();
}

function calcAg() {
    const sels = document.querySelectorAll('.s-inp');
    let ex = 0, ur = 0, ma = 0, re = 0;
    sels.forEach(s => {
        if(s.value === 'ex' || s.value === 'es') ex++;
        if(s.value === 'ps' || s.value === 'in') ur++;
        if(s.value === 'ma') ma++;
        if(s.value === 're') re++;
        s.parentElement.style.backgroundColor = s.value === 'ma' ? '#fee2e2' : (s.value === 'ps' || s.value === 'in' ? '#eff6ff' : '#dcfce7');
    });
    const fator = 4.3;
    document.getElementById('valElEsp').innerText = Math.round(ex * fator);
    document.getElementById('valUr').innerText = Math.round(ur * fator);
    document.getElementById('valMa').innerText = Math.round(ma * fator);
    document.getElementById('valRe').innerText = Math.round(re * fator);
    document.getElementById('valTotal').innerText = Math.round(sels.length * fator);
}

function salvarAg() {
    const key = `v16_${currentAg}_${document.getElementById('selMes').value}_${document.getElementById('selAno').value}`;
    const d = { n: document.getElementById('renameAg').value, s: document.getElementById('slotMin').value, m: [] };
    document.querySelectorAll('.s-inp').forEach(s => {
        d.m.push({ id: s.id, v: s.value, t: document.getElementById(s.id + '-tx').value });
    });
    localStorage.setItem(key, JSON.stringify(d));
    alert("Parametrização Salva!");
}

function carregarAg() {
    const key = `v16_${currentAg}_${document.getElementById('selMes').value}_${document.getElementById('selAno').value}`;
    const s = localStorage.getItem(key);
    gerarGradeAg();
    if(s) {
        const d = JSON.parse(s);
        document.getElementById('renameAg').value = d.n || "";
        document.getElementById('slotMin').value = d.s || 20;
        if(d.s != 20) gerarGradeAg();
        d.m.forEach(item => {
            const el = document.getElementById(item.id);
            if(el) {
                el.value = item.v;
                const tx = document.getElementById(item.id + '-tx');
                if(tx) { tx.value = item.t || ""; if(item.v === 'es') tx.style.display = 'block'; }
            }
        });
    } else {
        document.getElementById('renameAg').value = "";
    }
    document.getElementById('capTit').innerText = document.getElementById('renameAg').value || "Agenda";
    document.getElementById('capPeriodo').innerText = monthsExt[document.getElementById('selMes').value] + " / " + document.getElementById('selAno').value;
    calcAg();
}

function aplicarMassa() {
    document.querySelectorAll('.s-inp').forEach(s => { s.value = 'ex'; s.parentElement.style.backgroundColor = '#dcfce7'; });
    calcAg();
}

function openModal(t, txt) {
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-text').innerHTML = txt;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

window.onload = init;
