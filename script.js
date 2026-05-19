document.addEventListener('DOMContentLoaded', () => {
    
    const blocoDeNotas = document.getElementById('blocoDeNotas');
    const notaSalva = localStorage.getItem('minhaNota');
    if (notaSalva) {
        blocoDeNotas.value = notaSalva;
    }

    blocoDeNotas.addEventListener('input', () => {
        localStorage.setItem('minhaNota', blocoDeNotas.value);
        console.log("Nota salva no localStorage!"); 
    });

});