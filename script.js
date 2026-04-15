function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0,0);
}

function openModal(title, text) {
    document.getElementById('modal-title').innerText = title;
    // innerHTML permite que o <br> funcione para os fluxogramas
    document.getElementById('modal-text').innerHTML = text;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Fecha o modal se clicar fora da caixa branca
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        closeModal();
    }
}
