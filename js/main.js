// ELEMENTOS DA TELA -
const form = document.getElementsByClassName('form');
const filtros = document.getElementsByClassName('filtros');
const tabela = document.getElementById('tabela');
const optionEntradaSaida = document.getElementsByName('entradaSaida');
const opcaoParcelado = document.getElementsByName('parcelado');
const inputparcela = document.getElementById('qtde-parcelas');
const toastErro = document.getElementById('toast-erro-salvar');
const toastSucesso = document.getElementById('toast-sucesso-salvar');
const modalNovaEntradaSaida = new bootstrap.Modal(document.getElementById('modal-nova-entrada-saida'));
const modalPagar = new bootstrap.Modal(document.getElementById('modal-pagar'));
const formPagar = document.getElementsByClassName('form-pagar');
const meses = document.getElementsByName('meses');

// variáveis globais
let xhr = new XMLHttpRequest();
let dataInicial = '2022-02-01';
let dataFinal = '2022-02-28';
let resultado;
let idParcelaAtual = 0;
const hoje = new Date();

//URL's heroku x local
//const urlP = 'https://backend-financeiro-api.herokuapp.com/' // heroku;
const urlP = 'http://localhost:8080/' // local;


//START DA APLICAÇÃO - FUNÇÕES ENCADEADAS QUE DEVEM SER EXECUTADAS ASSIM QUE ESSE SCRIPT FOR CHAMADO.
dataAtual();


//Verifica que dia é hoje, monta a data inical e final para buscar no banco entradas e saidas de acordo com a data inicial e final
// Pela regra sempre será um intervalo de 01 mÊs, na primeira chamada o mês atual, mas essa função é chamada por outros métodos que enviam um mÊs como refencia.
// Se a chamada dessa função vem sem argumentos -1 é setado como padrão.
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


//Essa função seleciona o mês visualmente na tela de acordo com a data atual, ou o evento de click do usuário no card de seleção de meses.
function selecionarMes(mesAtual = 12) {
    for (let mes of meses) {
        if(mes.attributes.value.nodeValue == mesAtual){
            mes.classList = 'bg-warning text-white rounded-3'
        }
        mes.addEventListener('click', ev => {
            // ev.preventDefault()
            for (let i of meses) {
                i.classList.remove('bg-warning', 'text-white');
            }
            mes.classList = 'bg-warning text-white rounded-3';
            dataAtual(mes.attributes.value.nodeValue)
            listarParcelasMensal();
        });
    }
    listarParcelasMensal();
}


//habilita ou desabilita quantidade de parcelas
for(let i of opcaoParcelado){
    i.addEventListener('change', ()=>{
        if(i.id == 'sim-parcelado'){
            inputparcela.removeAttribute('disabled')
        }else{
            inputparcela.setAttribute('disabled', 'true')
            inputparcela.value = 1;       
        }
    })
}


// mostra esconde opções de entra ou saida no cadastro
for(let p of optionEntradaSaida){
    p.addEventListener('change', ()=>{
        document.getElementById('saida-only').classList.toggle('saida-only')
    })
}

function salvar(){
    console.log(form)
    const marcadoPago = document.getElementById('marcar-pago');
    const categorias = document.getElementsByName('categoria');
    let categoria = "Ricardo"
    for(let cat of categorias){
        if(cat.checked){
            categoria = cat.value
        }
    }
    payload = {
        descricao: form[0][2].value,
        tipoEntradaSaida: form[0][0].checked ? "Saída" : "Entrada",
        dataVencimento: form[0][4].value,
        valor: form[0][3].value.replace(/(\d{0,3})(\.?)(\d+)(\,)(\d{2})/, "$1$3.$5"),
        qtdeParcelas: form[0][8].value,
        custoDiario: form[0][11].checked,
        observacoes: form[0][5].value,
        recorrente: form[0][6].checked,
        pago: marcadoPago.checked,
        categoria: categoria
    }
    xhr.open('POST', `${urlP}entradasSaidas`, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    // xhr.setRequestHeader('Access-Control-Allow-Origin', 'xhr://localhost:5500');
    // xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true');
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
            listarParcelasMensal();
            modalNovaEntradaSaida.toggle();
            const toast = new bootstrap.Toast(toastSucesso);
            toast.show();
            //toggleModal();
        }else{
            const toast = new bootstrap.Toast(toastErro);
            modalNovaEntradaSaida.toggle();
            toast.show();
        }
    }
    xhr.send(JSON.stringify(payload));
    console.log(payload)
}

function converteNumero(numero){
   const  newvalue= numero.replace()
}



function listarParcelasMensal(){    
    let url =`${urlP}entradasSaidas/listaParcelasMensal?fim=${dataFinal}&inicial=${dataInicial}`
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
/*
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
    */
    //tabela.appendChild(tr)


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
        td2.textContent = e.valorEsperado.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
        let valorFormatado
        if(e.valorEfetivo){
            valorFormatado = e.valorEfetivo.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})
        }else{
            valorFormatado = "R$ -"
        }
        td3.textContent = valorFormatado;
        const dataFormatada = new Date(e.dataVencimento +'T00:00')
        td4.textContent = dataFormatada.toLocaleDateString();
        let dataFormatada2 = new Date(e.dataPagamento +'T00:00')
        if(e.dataPagamento){
            dataFormatada2 = dataFormatada2.toLocaleDateString();
        }else{
            dataFormatada2 = "";
        }
        td5.textContent = dataFormatada2;
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
                chamaModalPagar(pagarEditar[i].id)
            }else{
                editar(pagarEditar[i].id)

            }
        })
    }
}
//modalPagar.toggle(); // apagar depois

function chamaModalPagar(id){
    modalPagar.toggle();
    //document.getElementById('modal-pagar-id').classList.toggle('esconde')
    if(id){
        idParcelaAtual = id;
        resultado.forEach(e=>{
            if(e.id == id){
              formPagar[0][0].value = e.entradaSaida.descricao;
              formPagar[0][1].value = e.valorEsperado.toLocaleString('pt-br', {minimumFractionDigits: 2});
              formPagar[0][2].value = e.dataVencimento;
              formPagar[0][3].value = e.valorEsperado.toLocaleString('pt-br', {minimumFractionDigits: 2});
              formPagar[0][4].value = e.dataVencimento;
            }
        });        
    }else{
        console.log('não tem id')
    }
    

}

function pagar(){
    payload = {
        dataPagamento: formPagar[0][4].value,
        valorEfetivo: formPagar[0][3].value.replace(/(\d{0,3})(\.?)(\d+)(\,)(\d{2})/, "$1$3.$5")
    }
    
    let url = `${urlP}entradasSaidas/pagarParcela/${idParcelaAtual}`
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    // xhr.setRequestHeader('Access-Control-Allow-Origin', 'xhr://localhost:5500');
    // xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true');
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
            listarParcelasMensal();
            modalPagar.toggle()
            const toast = new bootstrap.Toast(toastSucesso);
            toast.show();
        }else{
            const toast = new bootstrap.Toast(toastErro);
            modalPagar.toggle()
            toast.show();
        }
    }
    xhr.send(JSON.stringify(payload));
    console.log(payload)






    
    // let url = `http://localhost:8080/entradasSaidas/pagarParcela/${idParcelaAtual}`
    // xhr.open("POST", url, true);
    // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    // xhr.onreadystatechange = function () { // Chama a função quando o estado mudar.
    //     if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
    //         listarParcelasMensal();
    //         const toast = new bootstrap.Toast(toastSucesso);
    //         toast.show();            
    //     }else{
    //         const toast = new bootstrap.Toast(toastErro);
    //         modalNovaEntradaSaida.toggle();
    //         toast.show();
    //     }
    // }
    // xhr.send(JSON.stringify(payload));
    
}
function editar(id ){
    alert("editando conta com id " + id)
}
function criarElemento(nomeElemento){
    return document.createElement(nomeElemento);
}


//selecionarMes();





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