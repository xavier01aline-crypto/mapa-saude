let currentAgId = 'ag1';
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function showPage(p) {
    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const b = document.getElementById('btn-' + p);
    if(b) b.classList.add('active');
    if(p === 'agendas') loadAg();
}

function init() {
    const m = document.getElementById('selMes');
    const a = document.getElementById('selAno');
    if (!m) return;
    months.forEach((name, i) => m.add(new Option(name, i)));
    for (let i = 2026; i <= 2028; i++) a.add(new Option(i, i));
    
    const tabs = document.getElementById('agTabs');
    for (let i = 1; i <= 9; i++) {
        let b = document.createElement('button');
        b.className = `tab-link ${i === 1 ? 'active' : ''}`;
        b.innerText = `Agenda 0${i}`;
        b.onclick = function() { 
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentAgId = `ag${i}`; loadAg(); 
        };
        tabs.appendChild(b);
    }
}

function gerarGrade() {
    const cont = document.getElementById('gradeDiv');
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let html = `<table class="grade-table"><thead><tr><th>Hora</th>`;
    dias.forEach(d => html += `<th>${d}</th>`);
    html += `</tr></thead><tbody>`;

    for (let min = 480; min < 1200; min += 20) {
        let h = Math.floor(min / 60).toString().padStart(2, '0');
        let m = (min % 60).toString().padStart(2, '0');
        html += `<tr><td style="font-weight:700;">${h}:${m}</td>`;
        for (let d = 0; d < 7; d++) {
            html += `<td><select class="s-inp" id="s-${min}-${d}"><option value="ex">EX</option><option value="ma">MA</option></select></td>`;
        }
        html += `</tr>`;
    }
    cont.innerHTML = html + `</tbody></table>`;
}

function saveAg() {
    const key = `v17_${currentAgId}_${document.getElementById('selMes').value}`;
    const data = { n: document.getElementById('renAg').value, m: [] };
    document.querySelectorAll('.s-inp').forEach(s => data.m.push({ id: s.id, v: s.value }));
    localStorage.setItem(key, JSON.stringify(data));
    alert("Salvo!");
}

function loadAg() {
    gerarGrade();
    const key = `v17_${currentAgId}_${document.getElementById('selMes').value}`;
    const s = localStorage.getItem(key);
    if(s) {
        const d = JSON.parse(s);
        document.getElementById('renAg').value = d.n || "";
        d.m.forEach(item => {
            const el = document.getElementById(item.id);
            if(el) el.value = item.v;
        });
    }
}

function openModal(t, txt) {
    document.getElementById('modal-content').innerHTML = `<h3>${t}</h3><p>${txt}</p>`;
    document.getElementById('modal').style.display = 'block';
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }

window.onload = init;
