const form = document.getElementsByClassName('form');
const filtros = document.getElementsByClassName('filtros');
const tabela = document.getElementById('tabela');

// variáveis globais
let xhr = new XMLHttpRequest();
let dataInicial = '2022-02-01';
let dataFinal = '2022-02-28';
let resultado;
let idPagamento;

function salvar() {
    payload = {
        descricao: form[0][2].value,
        tipoEntradaSaida: form[0][0].checked ? "Saída" : "Entrada",
        dataVencimento: form[0][4].value,
        valor: form[0][3].value,
        qtdeParcelas: form[0][9].value,
        recorrente: form[0][5].checked
    }
    xhr.open('POST', "http://localhost:8080/entradasSaidas", true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    // xhr.setRequestHeader('Access-Control-Allow-Origin', 'xhr://localhost:5500');
    // xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true');
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
            alert(xhr.responseText);
            listarParcelasMensal();
            toggleModal();
        }
    }
    xhr.send(JSON.stringify(payload));
    console.log(payload)
}


function listarParcelasMensal(){    
    let url = `http://localhost:8080/entradasSaidas/listaParcelasMensal?fim=${dataFinal}&inicial=${dataInicial}`
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function () { // Chama a função quando o estado mudar.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            resultado = JSON.parse(this.response);
            console.log(resultado);
            setTimeout(()=>{
                inserirDadosNaTela(resultado)
            },500)
        }
    }
    xhr.send();
}



function inserirDadosNaTela(dados){
    limparTabela();

    const tr = document.createElement('tr');
    const th = document.createElement('td');
    const th2 = document.createElement('td');
    const th3 = document.createElement('td');
    const th4 = document.createElement('td');
    const th5 = document.createElement('td');
    const th6 = document.createElement('td');
    const th7 = document.createElement('td');
    const th8 = document.createElement('td');

    th.classList ='header-table';
    th2.classList ='header-table';
    th3.classList ='header-table';
    th4.classList ='header-table';
    th5.classList ='header-table';
    th6.classList ='header-table';
    th7.classList ='header-table';
    th8.classList ='header-table';

    th8.textContent = "Tipo";
    th.textContent = "Descrição";
    th2.textContent = "Valor Esperado";
    th3.textContent = "Valor Efetivo";
    th4.textContent = "Data Vencimento";
    th5.textContent ="Data Pagamento";
    th6.textContent = "Status";
    th7.textContent = "Ações";

    tr.appendChild(th8)
    tr.appendChild(th)
    tr.appendChild(th2)
    tr.appendChild(th3)
    tr.appendChild(th4)
    tr.appendChild(th5)
    tr.appendChild(th6)
    tr.appendChild(th7)
    tabela.appendChild(tr)


    dados.forEach(e=>{
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        const td4 = document.createElement('td');
        const td5 = document.createElement('td');
        const td6 = document.createElement('td');
        const td7 = document.createElement('td');
        const td8 = document.createElement('td');
        const pagar = document.createElement('a');
        const editar = document.createElement('a');

        pagar.href = 'javascript:void(0)';
        pagar.id = e.id;
        pagar.classList = 'pagar-editar'
        pagar.textContent = 'Pagar'

        editar.href = 'javascript:void(0)';
        editar.id = e.id;
        editar.classList = 'pagar-editar'
        editar.textContent = 'Editar'

        td8.textContent = e.entradaSaida.tipoEntradaSaida;
        td.textContent = e.entradaSaida.descricao;
        td2.textContent = e.valorEsperado;
        td3.textContent = e.valorEfetivo;
        td4.textContent = e.dataVencimento;
        td5.textContent = e.dataPagamento;
        td6.textContent = e.status;
        td7.insertAdjacentElement('beforeend', pagar)
        td7.insertAdjacentText('beforeend', ' - ')
        td7.insertAdjacentElement('beforeend', editar)

        tr.appendChild(td8)
        tr.appendChild(td)
        tr.appendChild(td2)
        tr.appendChild(td3)
        tr.appendChild(td4)
        tr.appendChild(td5)
        tr.appendChild(td6)
        tr.appendChild(td7)
        tabela.appendChild(tr)
    });
    linksPagarEditar();
}

function limparTabela(){
    while(tabela.firstChild){
        tabela.removeChild(tabela.firstChild);
    }
}

// monitorando pagar editar
function linksPagarEditar(){
    const pagarEditar = document.getElementsByClassName('pagar-editar');
    for(let i = 0; i< pagarEditar.length; i++){
        pagarEditar[i].addEventListener('click', e=>{
            e.preventDefault()
            if(e.path[0].outerText == 'Pagar'){
                // pagar(pagarEditar[i].id)
                chamaModalPagar(pagarEditar[i].id)
            }else{
                editar(pagarEditar[i].id)

            }
        })
    }
}

function chamaModalPagar(id){
    document.getElementById('modal-pagar-id').classList.toggle('esconde')
    if(id){
        idPagamento = id;
        resultado.forEach(e=>{
            if(e.id == id){
              const formPagar = document.getElementsByClassName('form-pagar');
              formPagar[0].children[1].value = resultado[id].entradaSaida.descricao
              formPagar[0].children[3].value = resultado[id].valorEsperado
              formPagar[0].children[5].value = resultado[id].dataVencimento
            }
        })
    }else{
        console.log('não tem id')
    }

}

function pagar(){
    const formPagar = document.getElementsByClassName('form-pagar');
    console.log(formPagar)
    console.log(resultado[idPagamento])
    resultado[idPagamento].valorEfetivo = formPagar[0].children[8].value
    resultado[idPagamento].dataPagamento = formPagar[0].children[10].value

    console.log(resultado[idPagamento])
    /*
    let url = `http://localhost:8080/entradasSaidas/pagarParcela/${id}`
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function () { // Chama a função quando o estado mudar.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            listarParcelasMensal();
            
        }
    }
    xhr.send();
    */
}
function editar(id ){
    alert("editando conta com id " + id)
}
function criarElemento(nomeElemento){
    return document.createElement(nomeElemento);
}

const meses = document.getElementsByName('meses');
//selecionarMes();
function selecionarMes(mesAtual = 12) {
    for (let mes of meses) {
        if(mes.attributes.value.nodeValue == mesAtual){
            mes.classList = 'selecionado'
        }
        mes.addEventListener('click', ev => {
            // ev.preventDefault()
            for (let i of meses) {
                i.classList.remove('selecionado');
            }
            mes.classList = 'selecionado';
            dataAtual(mes.attributes.value.nodeValue)
            listarParcelasMensal();
        });
    }
    listarParcelasMensal();
}

const hoje = new Date();
function dataAtual(mesInformado = -1){

    if(mesInformado == -1){
        hoje.setDate(1);        
        dataInicial =`${hoje.getFullYear()}-${(hoje.getMonth()+1) < 10 ? '0'+(hoje.getMonth()+1) : hoje.getMonth()+1}-${hoje.getDate() < 10 ? '0'+hoje.getDate() : hoje.getDate()}`
        hoje.setMonth(hoje.getMonth()+1)
        hoje.setDate(0);
        dataFinal = `${hoje.getFullYear()}-${(hoje.getMonth()+1) < 10 ? '0'+(hoje.getMonth()+1) : hoje.getMonth()+1}-${hoje.getDate() <10 ? '0'+hoje.getDate() : hoje.getDate()}`
        selecionarMes(hoje.getMonth())
    }else{
        hoje.setDate(1);
        hoje.setMonth(mesInformado)
        dataInicial =`${hoje.getFullYear()}-${(hoje.getMonth()+1) < 10 ? '0'+(hoje.getMonth()+1) : hoje.getMonth()+1}-${hoje.getDate() < 10 ? '0'+hoje.getDate() : hoje.getDate()}`
        hoje.setMonth(hoje.getMonth()+1)
        hoje.setDate(0);
        console.log(hoje)
        dataFinal = `${hoje.getFullYear()}-${(hoje.getMonth()+1) < 10 ? '0'+(hoje.getMonth()+1) : hoje.getMonth()+1}-${hoje.getDate() <10 ? '0'+hoje.getDate() : hoje.getDate()}`
                
    }
}
dataAtual();


// controles dos modais
function toggleModal(){
    document.getElementById('container-modal-id').classList.toggle('esconde')
}
// Seleção dos meses


// o código abaixo fazia a selação do mes atual com base no retorno do backend. A lista vinha com todas a entradas/saidas e um array com todas as parcelas

// function listarMensal(){
//     var xhr = new XMLHttpRequest();
//     let url = `http://localhost:8080/entradasSaidas/listaMensal?fim=${filtros[0][1].value}&inicial=${filtros[0][0].value}`
//     xhr.open("GET", url, true);
//     xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
//     xhr.onreadystatechange = function () { // Chama a função quando o estado mudar.
//         if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
//             console.log("Cadastro efetuado com sucesso!");
//             resultado = JSON.parse(this.response);
//             console.log(resultado);
//             setTimeout(()=>{
//                 criaListaTabelaMensal(resultado)
//             },500)
//         }
//     }
//     xhr.send();
// }

// function criaListaTabelaMensal(dados){
//     dadosProntos = []
//     dados.forEach(e => {
//         filtraMesAtual = e.parcelas.filter(el=> el.dataVencimento.substring(0,7) == filtros[0][0].value.substring(0,7));
//             console.log(filtraMesAtual)
//             dadosProntos.push({
//                 descricao: e.descricao,
//                 dataVencimento: filtraMesAtual[0].dataVencimento,
//                 valorEfetivo: filtraMesAtual[0].valorEfetivo,
//                 dataPagamento: filtraMesAtual[0].dataPagamento,
//                 status: filtraMesAtual[0].status,
//                 valorEsperado: filtraMesAtual[0].valorEsperado
//              })
        
//     });
//     console.log(dadosProntos)
//     setTimeout(()=>{
//         inserirDadosNaTela(dadosProntos)
//     },600)
// }