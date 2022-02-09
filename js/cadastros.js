// elementos da tela
const formNovoFuncionario = document.getElementsByName('form-novo-funcionario');
const toastErro = document.getElementById('toast-erro-salvar');
const toastSucesso = document.getElementById('toast-sucesso-salvar');

//variáveis globais
let xhr = new XMLHttpRequest();

//URL's heroku x local
//const urlP = 'https://backend-financeiro-api.herokuapp.com/' // heroku;
const urlP = 'http://localhost:8080/' // local;


function salvar(){
    const payload = {
        nome: formNovoFuncionario[0][0].value,
        sobrenome: formNovoFuncionario[0][1].value,
        cargo: formNovoFuncionario[0][2].value,
        dataAdmissao: formNovoFuncionario[0][3].value,
    }

    xhr.open('POST', `${urlP}funcionarios`, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
            const toast = new bootstrap.Toast(toastSucesso);
            toast.show();
            limparFormSalvar();
        } else {
            const toast = new bootstrap.Toast(toastErro);
            toast.show();
        }
    }
    xhr.send(JSON.stringify(payload));

    console.log(payload)
}

function limparFormSalvar() {
    formNovoFuncionario[0].reset();
}