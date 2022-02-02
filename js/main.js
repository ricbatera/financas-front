// ELEMENTOS DA TELA -
const form = document.getElementsByClassName('form');
const filtros = document.getElementsByClassName('filtros');
const tabela = document.getElementById('tabela');
const tabelaEditar = document.getElementById('tabelaEditar');
const optionEntradaSaida = document.getElementsByName('entradaSaida');
const opcaoParcelado = document.getElementsByName('parcelado');
const inputparcela = document.getElementById('qtde-parcelas');
const toastErro = document.getElementById('toast-erro-salvar');
const toastSucesso = document.getElementById('toast-sucesso-salvar');
const modalNovaEntradaSaida = new bootstrap.Modal(document.getElementById('modal-nova-entrada-saida'));
const modalPagar = new bootstrap.Modal(document.getElementById('modal-pagar'));
const modalEditar = new bootstrap.Modal(document.getElementById('modal-editar'));
const formPagar = document.getElementsByClassName('form-pagar');
const formEditar = document.getElementsByClassName('form-editar');
const meses = document.getElementsByName('meses');
const modalLoading = document.getElementById('modal-loading');
const categorias = document.getElementsByName('categoria');
const categoriasEditar = document.getElementsByName('categoria-editar');
const statusRadio = document.getElementsByName('status-radio');
const tipoRadio = document.getElementsByName('tipo-radio');

// id's dos inidcadores na tela
const cardTotalRecebido = document.getElementById('card-total-recebido');
const cardTotalReceber = document.getElementById('card-total-receber');
const cardTotalEntradas = document.getElementById('card-total-entradas');
const cardTotalPago = document.getElementById('card-total-pago');
const cardTotalAberto = document.getElementById('card-total-aberto');
const cardTotalSaidas = document.getElementById('card-total-saidas');
const cardCustoDiario = document.getElementById('card-custo-diario');

// variáveis globais
let xhr = new XMLHttpRequest();
let dataInicial = '2022-02-01';
let dataFinal = '2022-02-28';
let resultado;
let idParcelaAtual = 0;
let idContaAtual = 0;
const hoje = new Date();
let indicadores;
let listaParcelasPorId;
let categoria = "Ricardo";
let categoriaEditar = "Ricardo";
const filtrosRefinados = { status: "Todos", tipo: "Todos" }

//URL's heroku x local
const urlP = 'https://backend-financeiro-api.herokuapp.com/' // heroku;
//const urlP = 'http://localhost:8080/' // local;


//START DA APLICAÇÃO - FUNÇÕES ENCADEADAS QUE DEVEM SER EXECUTADAS ASSIM QUE ESSE SCRIPT FOR CHAMADO.
dataAtual();


//Verifica que dia é hoje, monta a data inical e final para buscar no banco entradas e saidas de acordo com a data inicial e final
// Pela regra sempre será um intervalo de 01 mÊs, na primeira chamada o mês atual, mas essa função é chamada por outros métodos que enviam um mÊs como refencia.
// Se a chamada dessa função vem sem argumentos -1 é setado como padrão.
function dataAtual(mesInformado = -1) {
    modalLoading.classList.toggle('oculta');
    if (mesInformado == -1) {
        hoje.setDate(1);
        dataInicial = `${hoje.getFullYear()}-${(hoje.getMonth() + 1) < 10 ? '0' + (hoje.getMonth() + 1) : hoje.getMonth() + 1}-${hoje.getDate() < 10 ? '0' + hoje.getDate() : hoje.getDate()}`
        hoje.setMonth(hoje.getMonth() + 1)
        hoje.setDate(0);
        dataFinal = `${hoje.getFullYear()}-${(hoje.getMonth() + 1) < 10 ? '0' + (hoje.getMonth() + 1) : hoje.getMonth() + 1}-${hoje.getDate() < 10 ? '0' + hoje.getDate() : hoje.getDate()}`
        selecionarMes(hoje.getMonth())
    } else {
        hoje.setDate(1);
        hoje.setMonth(mesInformado)
        dataInicial = `${hoje.getFullYear()}-${(hoje.getMonth() + 1) < 10 ? '0' + (hoje.getMonth() + 1) : hoje.getMonth() + 1}-${hoje.getDate() < 10 ? '0' + hoje.getDate() : hoje.getDate()}`
        hoje.setMonth(hoje.getMonth() + 1)
        hoje.setDate(0);
        console.log(hoje)
        dataFinal = `${hoje.getFullYear()}-${(hoje.getMonth() + 1) < 10 ? '0' + (hoje.getMonth() + 1) : hoje.getMonth() + 1}-${hoje.getDate() < 10 ? '0' + hoje.getDate() : hoje.getDate()}`

    }
}


//Essa função seleciona o mês visualmente na tela de acordo com a data atual, ou o evento de click do usuário no card de seleção de meses.
function selecionarMes(mesAtual = 12) {
    for (let mes of meses) {
        if (mes.attributes.value.nodeValue == mesAtual) {
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
for (let i of opcaoParcelado) {
    i.addEventListener('change', () => {
        if (i.id == 'sim-parcelado') {
            inputparcela.removeAttribute('disabled')
        } else {
            inputparcela.setAttribute('disabled', 'true')
            inputparcela.value = 1;
        }
    })
}


// mostra esconde opções de entra ou saida no cadastro
for (let p of optionEntradaSaida) {
    p.addEventListener('change', () => {
        document.getElementById('saida-only').classList.toggle('saida-only')
    })
}

function salvar() {

    console.log(form)
    const marcadoPago = document.getElementById('marcar-pago');


    for (let cat of categorias) {
        if (cat.checked) {
            categoria = cat.value
        }
    }
    payload = {
        descricao: form[0][2].value,
        tipoEntradaSaida: form[0][0].checked ? "Saída" : "Entrada",
        dataVencimento: form[0][4].value,
        valor: form[0][3].value.replace(/(\d{0,3})(\.?)(\d+)(\,)(\d{2})/, "$1$3.$5"),
        qtdeParcelas: form[0][8].value,
        custoDiario: form[0][0].checked ? form[0][11].checked : false,
        //custoDiario: form[0][11].checked,
        observacoes: form[0][5].value,
        recorrente: form[0][6].checked,
        pago: marcadoPago.checked,
        categoria: categoria
    }
    xhr.open('POST', `${urlP}entradasSaidas`, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
            modalNovaEntradaSaida.toggle();
            listarParcelasMensal();
            modalLoading.classList.toggle('oculta');
            const toast = new bootstrap.Toast(toastSucesso);
            toast.show();
            limparFormSalvar();
            resetFiltros();
        } else {
            const toast = new bootstrap.Toast(toastErro);
            modalNovaEntradaSaida.toggle();
            toast.show();
        }
    }
    xhr.send(JSON.stringify(payload));
    console.log(payload)
}

function converteNumero(numero) {
    const newvalue = numero.replace()
}



function listarParcelasMensal() {
    let url = `${urlP}entradasSaidas/listaParcelasMensal?fim=${dataFinal}&inicial=${dataInicial}`
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function () { // Chama a função quando o estado mudar.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            resultado = JSON.parse(this.response);
            console.log(resultado);
            setTimeout(() => carregaIndicadores(), 100);
            setTimeout(() => inserirDadosNaTela(resultado), 500);
            setTimeout(() => modalLoading.classList.toggle('oculta'), 800);
            ;
        }
    }
    xhr.send();
    //modalLoading.classList.remove('oculta');
}



function inserirDadosNaTela(dados) {
    limparTabela();
    dados.forEach(e => {
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
        const icone = document.createElement('i');
        const iconeEditar = document.createElement('i');

        pagar.href = 'javascript:void(0)';
        pagar.id = e.id;
        pagar.classList = 'pagar-editar';
        icone.classList = 'fas fa-hand-holding-usd';
        icone.id = "Pagar"
        pagar.setAttribute('data-bs-toggle', 'tooltip');
        pagar.setAttribute('data-bs-placement', 'top');
        pagar.setAttribute('title', 'Pagar ou Receber');
        pagar.insertAdjacentElement('beforeend', icone)
        //data-bs-toggle="tooltip" data-bs-placement="top" title="Tooltip on top"

        editar.href = 'javascript:void(0)';
        editar.id = e.id;
        editar.setAttribute('data-bs-toggle', 'tooltip');
        editar.setAttribute('data-bs-placement', 'top');
        editar.setAttribute('title', 'Editar ou Apagar');
        editar.classList = 'pagar-editar';
        iconeEditar.classList = 'far fa-edit';
        iconeEditar.id = "Editar"
        editar.insertAdjacentElement('beforeend', iconeEditar);

        td8.textContent = e.entradaSaida.tipoEntradaSaida;
        td.textContent = e.entradaSaida.descricao;
        td2.textContent = e.valorEsperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        let valorFormatado
        if (e.valorEfetivo) {
            valorFormatado = e.valorEfetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
        } else {
            valorFormatado = "R$ -"
        }
        td3.textContent = valorFormatado;
        const dataFormatada = new Date(e.dataVencimento + 'T00:00')
        td4.textContent = dataFormatada.toLocaleDateString();
        let dataFormatada2 = new Date(e.dataPagamento + 'T00:00')
        if (e.dataPagamento) {
            dataFormatada2 = dataFormatada2.toLocaleDateString();
        } else {
            dataFormatada2 = "";
        }
        td5.textContent = dataFormatada2;
        td6.textContent = new Date() > new Date(e.dataVencimento) && e.status == "Aberto"? "Atrasado": e.status;
        if(td6.textContent == "Atrasado"){
            td6.classList.add('atrasado');
        }
        // td6.textContent = e.status;
        td7.insertAdjacentElement('beforeend', pagar)
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

function limparTabela() {
    while (tabela.firstChild) {
        tabela.removeChild(tabela.firstChild);
    }
}

function limparTabelaEditar() {
    while (tabelaEditar.firstChild) {
        tabelaEditar.removeChild(tabelaEditar.firstChild);
    }
}

// monitorando pagar editar
function linksPagarEditar() {
    const pagarEditar = document.getElementsByClassName('pagar-editar');
    for (let i = 0; i < pagarEditar.length; i++) {
        pagarEditar[i].addEventListener('click', e => {
            e.preventDefault()
            if (e.path[0].id == 'Pagar') {
                chamaModalPagar(pagarEditar[i].id)
            } else {
                editar(pagarEditar[i].id)
            }
        })
    }
}
//modalPagar.toggle(); // apagar depois

function chamaModalPagar(id) {
    modalPagar.toggle();
    //document.getElementById('modal-pagar-id').classList.toggle('esconde')
    if (id) {
        idParcelaAtual = id;
        resultado.forEach(e => {
            if (e.id == id) {
                idContaAtual = e.entradaSaida.id
                formPagar[0][0].value = e.entradaSaida.descricao;
                formPagar[0][1].value = e.valorEsperado.toLocaleString('pt-br', { minimumFractionDigits: 2 });
                formPagar[0][2].value = e.dataVencimento;
                formPagar[0][3].value = e.valorEsperado.toLocaleString('pt-br', { minimumFractionDigits: 2 });
                formPagar[0][4].value = e.dataVencimento;
            }
        });
    } else {
        console.log('não tem id')
    }
}

function editar(id) {
    modalEditar.toggle();
    //console.log(formEditar)
    if (id) {
        idParcelaAtual = id;
        resultado.forEach(e => {
            if (e.id == id) {
                idContaAtual = e.entradaSaida.id
                custoD = document.getElementsByName('custo-diario-edita');
                carregaParcelasPorId(e.entradaSaida.id);
                formEditar[0][0].value = e.entradaSaida.descricao;
                formEditar[0][2].value = e.entradaSaida.observacoes;
                for (let p of categoriasEditar) {
                    if (e.entradaSaida.categoria == p.value) {
                        p.checked = true
                    }
                }
                if (e.entradaSaida.custoDiario) {
                    formEditar[0][7].checked = true
                } else {
                    formEditar[0][8].checked = true
                }
            }
        })

    }
}

function carregaParcelasPorId(id) {
    let url = `${urlP}entradasSaidas/buscarEntradaSaida/${id}`
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function () { // Chama a função quando o estado mudar.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            listaParcelasPorId = JSON.parse(this.response);
            //console.log(listaParcelasPorId);
            carregarParcelasEditar(listaParcelasPorId)
        }
    }
    xhr.send();
}

function carregarParcelasEditar(listaDeParcelas) {
    limparTabelaEditar();
    listaDeParcelas.forEach(e => {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        const td4 = document.createElement('td');
        const td5 = document.createElement('td');
        const td6 = document.createElement('td');


        const dataFormatada = new Date(e.dataVencimento + 'T00:00');
        let dataFormatada2 = new Date(e.dataPagamento + 'T00:00')
        if (e.dataPagamento) {
            dataFormatada2 = dataFormatada2.toLocaleDateString();
        } else {
            dataFormatada2 = "";
        }
        if (e.valorEfetivo) {
            valorFormatado = e.valorEfetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
        } else {
            valorFormatado = "R$ -"
        }

        td.textContent = dataFormatada.toLocaleDateString();
        td2.textContent = dataFormatada2;
        td3.textContent = e.valorEsperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        td4.textContent = valorFormatado;
        td5.textContent = e.status;


        tr.appendChild(td);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tabelaEditar.appendChild(tr)
    })
}

function pagar() {
    //modalLoading.classList.toggle('oculta');
    payload = {
        dataPagamento: formPagar[0][4].value,
        valorEfetivo: formPagar[0][3].value.replace(/(\d{0,3})(\.?)(\d+)(\,)(\d{2})/, "$1$3.$5")
    }

    let url = `${urlP}entradasSaidas/pagarParcela/${idParcelaAtual}`
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
            listarParcelasMensal();
            setTimeout(() => {
                carregaIndicadores();
                modalLoading.classList.toggle('oculta');
            }, 300)
            modalPagar.toggle()
            const toast = new bootstrap.Toast(toastSucesso);
            toast.show();
            resetFiltros();
        } else {
            modalLoading.classList.toggle('oculta');
            const toast = new bootstrap.Toast(toastErro);
            modalPagar.toggle()
            toast.show();
        }
    }
    xhr.send(JSON.stringify(payload));
    console.log(payload)

}

// controles dos modais
function toggleModal() {
    document.getElementById('container-modal-id').classList.toggle('esconde')
}

function carregaIndicadores() {
    let url = `${urlP}indicadores?fim=${dataFinal}&inicial=${dataInicial}`
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function () { // Chama a função quando o estado mudar.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            indicadores = JSON.parse(this.response);
            console.log(indicadores);
            setTimeout(() => {
                mostraIndicadoresNaTela(indicadores)
            }, 500)
        }
    }
    xhr.send();
}

function mostraIndicadoresNaTela(indicadores) {
    cardCustoDiario.innerText = indicadores.indicadoresFormatados.custoDiario;
    cardTotalRecebido.innerText = indicadores.indicadoresFormatados.totalEntradasRecebidas;
    cardTotalReceber.innerText = indicadores.indicadoresFormatados.totalEntradasAbertas;
    cardTotalEntradas.innerText = indicadores.indicadoresFormatados.totalEntradas;
    cardTotalPago.innerText = indicadores.indicadoresFormatados.totalSaidasPagas;
    cardTotalAberto.innerText = indicadores.indicadoresFormatados.totalSaidasAbertas;
    cardTotalSaidas.innerText = indicadores.indicadoresFormatados.totalSaidas;
}

function limparFormSalvar() {
    for (let p of optionEntradaSaida) {
        if (p.id == 'saida') {
            document.getElementById('saida-only').classList.remove('saida-only')
        }
    }
    for (let i of opcaoParcelado) {

        if (i.id == "sim-parcelado") {
            inputparcela.removeAttribute('disabled')
        } else {
            inputparcela.setAttribute('disabled', 'true')
            inputparcela.value = 1;
        }
    }

    form[0].reset();
}

function apagarRegistro(id) {

    resultado.forEach(e => {
        if (e.id == idParcelaAtual) {
            let url = `${urlP}entradasSaidas/apagar/${e.entradaSaida.id}`
            xhr.open("DELETE", url, true);
            xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            xhr.onreadystatechange = function () { // Chama a função quando o estado mudar.
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    modalLoading.classList.toggle('oculta');
                    listarParcelasMensal();
                }
            }
            xhr.send();
        }
    })
}

function update() {
    //alert('em desenvolvimento')
    for (let p of categoriasEditar) {
        if (p.checked) {
            categoriaEditar = p.value
        }
    }
    payload = {
        descricao: formEditar[0][0].value,
        observacoes: formEditar[0][2].value,
        categoria: categoriaEditar,
        custoDiario: formEditar[0][7].checked,
        //id: idContaAtual
    }

    xhr.open('POST', `${urlP}entradasSaidas/editar/${idContaAtual}`, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
            modalEditar.toggle();
            listarParcelasMensal();
            modalLoading.classList.toggle('oculta');
            const toast = new bootstrap.Toast(toastSucesso);
            toast.show();
        } else {
            modalEditar.toggle();
            const toast = new bootstrap.Toast(toastErro);
            toast.show();
        }
    }
    xhr.send(JSON.stringify(payload));
}

//listener dos filtros

for (let i of statusRadio) {
    i.addEventListener('change', (() => {
        for (let t of statusRadio) {
            if (t.checked) {
                filtrosRefinados.status = t.value;
            }
        }
        console.log(filtrosRefinados)
        executarFiltros();
    }))
}

for (let i of tipoRadio) {
    i.addEventListener('change', () => {
        for (let t of tipoRadio) {
            if (t.checked) {
                filtrosRefinados.tipo = t.value;
            }
        }
        console.log(filtrosRefinados)
        executarFiltros();
    })
}

function executarFiltros() {
    let listaFiltrada;
    switch (filtrosRefinados.status) {
        case 'Todos':
            filtraEntradasESaidas(resultado);
            break;
        case 'Aberto':
            listaFiltrada = resultado.filter(e => e.status == 'Aberto');
            filtraEntradasESaidas(listaFiltrada);
            break;
        case 'Pago':
            listaFiltrada = resultado.filter(e => e.status == 'Pago');
            filtraEntradasESaidas(listaFiltrada);
            break;
        case 'Vencidos':
            listaFiltrada = filtrarVencidos(resultado);
            filtraEntradasESaidas(listaFiltrada);
            break;
        case 'No Prazo':
            listaFiltrada = filtrarNaoVencidos(resultado);
            filtraEntradasESaidas(listaFiltrada);
            break;
    }
    //filtraEntradasESaidas(resultado);
}

function filtraEntradasESaidas(lista) {
    let listaFiltrada;
    switch (filtrosRefinados.tipo) {
        case 'Todos':
            inserirDadosNaTela(lista)
            break;
        case 'Entrada':
            listaFiltrada = lista.filter(e => e.entradaSaida.tipoEntradaSaida == 'Entrada')
            inserirDadosNaTela(listaFiltrada)
            break;
        case 'Saida':
            listaFiltrada = lista.filter(e => e.entradaSaida.tipoEntradaSaida == 'Saída')
            inserirDadosNaTela(listaFiltrada)
            break;
    }
}

function filtrarVencidos(lista) {
    let listaVencidos = lista.filter(e => e.status == "Aberto" && new Date(e.dataVencimento + 'T00:00') < Date.now());
    console.log(listaVencidos)
    return listaVencidos;
}
function filtrarNaoVencidos(lista) {
    let listaNaoVencidos = lista.filter(e => e.status == "Aberto" && new Date(e.dataVencimento + 'T00:00') > Date.now())
    return listaNaoVencidos;
}

function resetFiltros(){
    statusRadio[0].checked = true;
    filtrosRefinados.tipo = "Todos"
    tipoRadio[0].checked = true;
    filtrosRefinados.status = "Todos";
}