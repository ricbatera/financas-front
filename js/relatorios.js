// ELEMENTOS NA TELA
const menuMeses = document.getElementsByClassName('menu-meses');
const valorGeralEstimado = document.getElementById('geral-estimado');
const valorGeralEfetivo = document.getElementById('geral-efetivo');
const valorGeralTotal = document.getElementById('geral-total');

const valorCombustivelEstimado = document.getElementById('combustivel-estimado');
const valorCombustivelEfetivo = document.getElementById('combustivel-efetivo');
const valorCombustivelTotal = document.getElementById('combustivel-total');

const valorValeEstimado = document.getElementById('vale-estimado');
const valorValeEfetivo = document.getElementById('vale-efetivo');
const valorValeTotal = document.getElementById('vale-total');

const valorGasEstimado = document.getElementById('gas-estimado');
const valorGasEfetivo = document.getElementById('gas-efetivo');
const valorGasTotal = document.getElementById('gas-total');

const valorEletricaEstimado = document.getElementById('eletrica-estimado');
const valorEletricaEfetivo = document.getElementById('eletrica-efetivo');
const valorEletricaTotal = document.getElementById('eletrica-total');

const valorVtEstimado = document.getElementById('vt-estimado');
const valorVtEfetivo = document.getElementById('vt-efetivo');
const valorVtTotal = document.getElementById('vt-total');

const valorVrEstimado = document.getElementById('vr-estimado');
const valorVrEfetivo = document.getElementById('vr-efetivo');
const valorVrTotal = document.getElementById('vr-total');

const valorHidraulicaEstimado = document.getElementById('hidraulica-estimado');
const valorHidraulicaEfetivo = document.getElementById('hidraulica-efetivo');
const valorHidraulicaTotal = document.getElementById('hidraulica-total');

const valorSalarioEstimado = document.getElementById('salario-estimado');
const valorSalarioEfetivo = document.getElementById('salario-efetivo');
const valorSalarioTotal = document.getElementById('salario-total');

const advertenciaGeral = document.getElementById('advertencia-geral');
const advertenciaCombustivel = document.getElementById('advertencia-combustivel');
const advertenciaSalario = document.getElementById('advertencia-salario');
const advertenciaAdiantamento = document.getElementById('advertencia-adiantamento');
const advertenciaVt = document.getElementById('advertencia-vt');
const advertenciaVr = document.getElementById('advertencia-vr');
const advertenciaGas = document.getElementById('advertencia-gas');
const advertenciaEletrica = document.getElementById('advertencia-eletrica');
const advertenciaHidraulica = document.getElementById('advertencia-hidraulica');

const totalPrevistoMes = document.getElementById('total-previsto-mes');
const totalEfetivoMes = document.getElementById('total-efetivo-mes');
const totalResultadoMes = document.getElementById('total-resultado-mes');

//URL's heroku x local
//const urlP = 'https://backend-financeiro-api.herokuapp.com/' // heroku;
//const urlP = 'http://localhost:8080/' // local;
const urlP = 'http://54.165.200.215:8080/' // AWS;

// variáveis globais
let xhr = new XMLHttpRequest();
let hoje = new Date;
let mesSelecionado = hoje.getMonth();
let resultado = [];

let advertencias = {
    geral: true,
    combustivel: true,
    salarios: true,
    adiantamentos: true,
    vt: true,
    vr: true,
    gas: true,
    eletrica: true,
    hidraulica: true
}

// funções automáticas que setam algumas variáveis globais
selecionaMes();
listarParcelas();
setTimeout(() => {

}, 3000);

function selecionaMes() {
    for (let i = 0; i < 12; i++) {
        menuMeses[i].classList.remove('mes-selecionado')
        if (i == mesSelecionado) {
            menuMeses[i].classList.add('mes-selecionado')
        }
    }
}

function listarParcelas() {
    let url = `${urlP}entradasSaidas/listaParcelasMes?datas=${formataData(hoje)}`
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function () { // Chama a função quando o estado mudar.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            resultado = JSON.parse(this.response);
            calculaIndicadores();
            console.log(resultado);
        }
    }
    xhr.send();
}

//listeners globais
for (const mes of menuMeses) {
    mes.addEventListener('click', () => {
        switch (mes.textContent) {
            case "Janeiro":
                mesSelecionado = 0;
                break;
            case "Fevereiro":
                mesSelecionado = 1;
                break;
            case "Março":
                mesSelecionado = 2;
                break;
            case "Abril":
                mesSelecionado = 3;
                break;
            case "Maio":
                mesSelecionado = 4;
                break;
            case "Junho":
                mesSelecionado = 5;
                break;
            case "Julho":
                mesSelecionado = 6;
                break;
            case "Agosto":
                mesSelecionado = 7;
                break;
            case "Setembro":
                mesSelecionado = 8;
                break;
            case "Outubro":
                mesSelecionado = 9;
                break;
            case "Novembro":
                mesSelecionado = 10;
                break;
            case "Dezembro":
                mesSelecionado = 11;
                break;
        }
        selecionaMes();
        setaData();
        listarParcelas();
    })
}

// funções de controle e transformação
function formataData(data) {
    const dataTransformada = data.toLocaleDateString('PT-BR').replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
    return dataTransformada;
}

function setaData() {
    hoje.setMonth(mesSelecionado)
}

// área de testes comuns

function calculaIndicadores() {
    let tiposEntradasSaidas = ["Saída", "Entrada"];
    let categorias = ["VR", "VT", "Salário", "Elétrica", "Hidraúlica", "Geral", "Combustível", "Gás", "Vale"]
    indicadores = [];
    totais = [];
    //filtra as saídas - e em seguida refina.
    let obj = new Object();
    for (let tipo of tiposEntradasSaidas) {

        const listaTotais = resultado
            .filter((e) => e.entradaSaida.tipoEntradaSaida == tipo);

        const totalGeral = listaTotais.reduce((acc, v) => acc + v.valorEsperado, 0);
        const abertos = listaTotais.filter((e) => e.status == "Aberto")
        let quitado = false;
        if (abertos.length == 0) quitado = true;
        const TotalEfetivo = listaTotais
            .filter((e) => e.status == "Pago")
            .reduce((acc, v) => acc + v.valorEfetivo, 0)
        totais.push({ totalGeral, TotalEfetivo, tipo, quitado })

        for (let categoria of categorias) {
            //filtrando e somando as categorias
            const lista = resultado
                .filter((e) => e.entradaSaida.tipoEntradaSaida == tipo)
                .filter((e) => e.entradaSaida.categoria == categoria);
            const Esperado = lista.reduce((acc, v) => acc + v.valorEsperado, 0);

            //filtrando abertas para garantir que tudo está pago
            const abertas = lista.filter((e) => e.status == "Aberto");
            let quitada = false;
            if (abertas.length == 0) quitada = true;

            //filtrando somente as pagas
            const listaEfetivo = lista.filter((e) => e.valorEfetivo);
            const Efetivo = listaEfetivo.reduce((acc, v) => acc + v.valorEfetivo, 0);

            // verifica se tem economia ou prejuízo
            const resul = Esperado - Efetivo;

            indicadores.push({ tipo, categoria, Esperado, Efetivo, resul, quitada })
            //console.log(lista)            
        }
    }
    console.log(totais)
    insereIndicadoresSaidasNaTela(indicadores, totais);
    //console.log(indicadores);
}

function insereIndicadoresSaidasNaTela(listaIndicadores, listaTotais) {
    for (indicador of listaIndicadores) {
        if (indicador.tipo == "Saída") {
            switch (indicador.categoria) {
                case "VR":
                    valorVrEfetivo.textContent = indicador.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    valorVrEstimado.textContent = indicador.Esperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    if (indicador.resul > 0) {
                        valorVrTotal.textContent = `de economia: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
                    } else if (indicador.resul < 0) {
                        valorVrTotal.textContent = `de prejuízo: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                    } else {
                        valorVrTotal.textContent = "Meta Atingida!";
                    }
                    if (indicador.quitada) {
                        advertenciaVr.style.display = "none";
                    } else {
                        advertenciaVr.style.display = "block";
                    }
                    break;
                case "VT":
                    valorVtEfetivo.textContent = indicador.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    valorVtEstimado.textContent = indicador.Esperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    if (indicador.resul > 0) {
                        valorVtTotal.textContent = `de economia: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
                    } else if (indicador.resul < 0) {
                        valorVtTotal.textContent = `de prejuízo: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                    } else {
                        valorVtTotal.textContent = "Meta Atingida!";
                    }
                    if (indicador.quitada) {
                        advertenciaVt.style.display = "none";
                    } else {
                        advertenciaVt.style.display = "block";
                    }
                    break;
                case "Salário":
                    valorSalarioEfetivo.textContent = indicador.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    valorSalarioEstimado.textContent = indicador.Esperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    if (indicador.resul > 0) {
                        valorSalarioTotal.textContent = `de economia: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
                    } else if (indicador.resul < 0) {
                        valorSalarioTotal.textContent = `de prejuízo: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                    } else {
                        valorSalarioTotal.textContent = "Meta Atingida!";
                    }
                    if (indicador.quitada) {
                        advertenciaSalario.style.display = "none";
                    } else {
                        advertenciaSalario.style.display = "block";
                    }
                    break;
                case "Elétrica":
                    valorEletricaEfetivo.textContent = indicador.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    valorEletricaEstimado.textContent = indicador.Esperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    if (indicador.resul > 0) {
                        valorEletricaTotal.textContent = `de economia: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
                    } else if (indicador.resul < 0) {
                        valorEletricaTotal.textContent = `de prejuízo: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                    } else {
                        valorEletricaTotal.textContent = "Meta Atingida!";
                    }
                    if (indicador.quitada) {
                        advertenciaEletrica.style.display = "none";
                    } else {
                        advertenciaEletrica.style.display = "block";
                    }
                    break;
                case "Hidraúlica":
                    valorHidraulicaEfetivo.textContent = indicador.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    valorHidraulicaEstimado.textContent = indicador.Esperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    if (indicador.resul > 0) {
                        valorHidraulicaTotal.textContent = `de economia: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
                    } else if (indicador.resul < 0) {
                        valorHidraulicaTotal.textContent = `de prejuízo: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                    } else {
                        valorHidraulicaTotal.textContent = "Meta Atingida!";
                    }
                    if (indicador.quitada) {
                        advertenciaHidraulica.style.display = "none";
                    } else {
                        advertenciaHidraulica.style.display = "block";
                    }
                    break;
                case "Geral":
                    valorGeralEfetivo.textContent = indicador.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    valorGeralEstimado.textContent = indicador.Esperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    if (indicador.resul > 0) {
                        valorGeralTotal.textContent = `de economia: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
                    } else if (indicador.resul < 0) {
                        valorGeralTotal.textContent = `de prejuízo: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                    } else {
                        valorGeralTotal.textContent = "Meta Atingida!";
                    }
                    if (indicador.quitada) {
                        advertenciaGeral.style.display = "none";
                    } else {
                        advertenciaGeral.style.display = "block";
                    }
                    break;
                case "Combustível":
                    valorCombustivelEfetivo.textContent = indicador.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    valorCombustivelEstimado.textContent = indicador.Esperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    if (indicador.resul > 0) {
                        valorCombustivelTotal.textContent = `de economia: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
                    } else if (indicador.resul < 0) {
                        valorCombustivelTotal.textContent = `de prejuízo: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                    } else {
                        valorCombustivelTotal.textContent = "Meta Atingida!";
                    }
                    if (indicador.quitada) {
                        advertenciaCombustivel.style.display = "none";
                    } else {
                        advertenciaCombustivel.style.display = "block";
                    }
                    break;
                case "Gás":
                    valorGasEfetivo.textContent = indicador.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    valorGasEstimado.textContent = indicador.Esperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    if (indicador.resul > 0) {
                        valorGasTotal.textContent = `de economia: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
                    } else if (indicador.resul < 0) {
                        valorGasTotal.textContent = `de prejuízo: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                    } else {
                        valorGasTotal.textContent = "Meta Atingida!";
                    }
                    if (indicador.quitada) {
                        advertenciaGas.style.display = "none";
                    } else {
                        advertenciaGas.style.display = "block";
                    }
                    break;
                case "Vale":
                    valorValeEfetivo.textContent = indicador.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    valorValeEstimado.textContent = indicador.Esperado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    if (indicador.resul > 0) {
                        valorValeTotal.textContent = `de economia: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`
                    } else if (indicador.resul < 0) {
                        valorValeTotal.textContent = `de prejuízo: ${indicador.resul.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                    } else {
                        valorValeTotal.textContent = "Meta Atingida!";
                    }
                    if (indicador.quitada) {
                        advertenciaAdiantamento.style.display = "none";
                    } else {
                        advertenciaAdiantamento.style.display = "block";
                    }
                    break;


            }
        }
    }
    for(total of listaTotais){
        if(total.tipo == "Saída"){
            totalEfetivoMes.textContent = total.TotalEfetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            totalPrevistoMes.textContent = total.totalGeral.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            res = total.totalGeral - total.TotalEfetivo;
            if(res >0){
                totalResultadoMes.textContent = `Economia nos gastos de ${res.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
            }else if(res < 0){
                totalResultadoMes.textContent = `Prejuizo nos gastos de ${res.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
            }else{
                totalResultadoMes.textContent = `Saldo ${res.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}, meta atingida.`
            }
        }
    }
}

/*
function calculaIndicadores() {
    indicadores = {
        geral: { Estimado: 0, Efetivo: 0, total: 0 },
        combustivel: { Estimado: 0, Efetivo: 0, total: 0 },
        salarios: { Estimado: 0, Efetivo: 0, total: 0 },
        adiantamentos: { Estimado: 0, Efetivo: 0, total: 0 },
        vt: { Estimado: 0, Efetivo: 0, total: 0 },
        vr: { Estimado: 0, Efetivo: 0, total: 0 },
        gas: { Estimado: 0, Efetivo: 0, total: 0 },
        eletrica: { Estimado: 0, Efetivo: 0, total: 0 },
        hidraulica: { Estimado: 0, Efetivo: 0, total: 0 },
    };
    advertencias = {
        geral: true,
        combustivel: true,
        salarios: true,
        adiantamentos: true,
        vt: true,
        vr: true,
        gas: true,
        eletrica: true,
        hidraulica: true
    }
    //zerarValoresTela();

    resultado.forEach(e => {
        if (e.entradaSaida.tipoEntradaSaida == "Saída") {
            if (e.entradaSaida.categoria == "Gás") {
                indicadores.gas.Estimado += e.valorEsperado;
                valorGasEstimado.textContent = indicadores.gas.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorGasEstimado.textContent = indicadores.gas.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Geral") {
                indicadores.geral.Estimado += e.valorEsperado;
                valorGeralEstimado.textContent = indicadores.geral.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorGeralEstimado.textContent = indicadores.geral.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Combustível") {
                indicadores.combustivel.Estimado += e.valorEsperado;
                valorCombustivelEstimado.textContent = indicadores.combustivel.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorCombustivelEstimado.textContent = indicadores.combustivel.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Salário") {
                indicadores.salarios.Estimado += e.valorEsperado;
                valorSalarioEstimado.textContent = indicadores.salarios.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorSalarioEstimado.textContent = indicadores.salarios.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Vale") {
                indicadores.adiantamentos.Estimado += e.valorEsperado;
                valorValeEstimado.textContent = indicadores.adiantamentos.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorValeEstimado.textContent = indicadores.adiantamentos.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "VT") {
                indicadores.vt.Estimado += e.valorEsperado;
                valorVtEstimado.textContent = indicadores.vt.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorVtEstimado.textContent = indicadores.vt.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "VR") {
                indicadores.vr.Estimado += e.valorEsperado;
                valorVrEstimado.textContent = indicadores.vr.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorVrEstimado.textContent = indicadores.vr.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Hidraúlica") {
                indicadores.hidraulica.Estimado += e.valorEsperado;
                valorHidraulicaEstimado.textContent = indicadores.hidraulica.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorHidraulicaEstimado.textContent = indicadores.hidraulica.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Elétrica") {
                indicadores.eletrica.Estimado += e.valorEsperado;
                valorEletricaEstimado.textContent = indicadores.eletrica.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorEletricaEstimado.textContent = indicadores.eletrica.Estimado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }
        
        
        if (e.entradaSaida.tipoEntradaSaida == "Saída") {
            if (e.entradaSaida.categoria == "Gás") {
                e.valorEfetivo? advertencias.gas = true: advertencias.gas = false;
                indicadores.gas.Efetivo += e.valorEfetivo? e.valorEfetivo: 0;
                valorGasEfetivo.textContent = indicadores.gas.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorGasEfetivo.textContent = indicadores.gas.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Geral") {
                e.valorEfetivo? advertencias.geral = true: advertencias.geral = false;
                indicadores.geral.Efetivo += e.valorEfetivo? e.valorEfetivo: 0;
                valorGeralEfetivo.textContent = indicadores.geral.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorGeralEfetivo.textContent = indicadores.geral.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Combustível") {
                e.valorEfetivo? advertencias.combustivel = true: advertencias.combustivel = false;
                indicadores.combustivel.Efetivo += e.valorEfetivo? e.valorEfetivo: 0;
                valorCombustivelEfetivo.textContent = indicadores.combustivel.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorCombustivelEfetivo.textContent = indicadores.combustivel.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Salário") {
                e.valorEfetivo? advertencias.salarios = true: advertencias.salarios = false;
                indicadores.salarios.Efetivo += e.valorEfetivo? e.valorEfetivo: 0;
                valorSalarioEfetivo.textContent = indicadores.salarios.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorSalarioEfetivo.textContent = indicadores.salarios.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Vale") {
                e.valorEfetivo? advertencias.adiantamentos = true: advertencias.adiantamentos = false;
                indicadores.adiantamentos.Efetivo += e.valorEfetivo? e.valorEfetivo: 0;
                valorValeEfetivo.textContent = indicadores.adiantamentos.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorValeEfetivo.textContent = indicadores.adiantamentos.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "VT") {
                e.valorEfetivo? advertencias.vt = true: advertencias.vt = false;
                indicadores.vt.Efetivo += e.valorEfetivo? e.valorEfetivo: 0;
                valorVtEfetivo.textContent = indicadores.vt.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorVtEfetivo.textContent = indicadores.vt.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "VR") {
                e.valorEfetivo? advertencias.vr = true: advertencias.vr = false;
                indicadores.vr.Efetivo += e.valorEfetivo? e.valorEfetivo: 0;
                valorVrEfetivo.textContent = indicadores.vr.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorVrEfetivo.textContent = indicadores.vr.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Hidraúlica") {
                e.valorEfetivo? advertencias.hidraulica = true: advertencias.hidraulica = false;
                indicadores.hidraulica.Efetivo += e.valorEfetivo? e.valorEfetivo: 0;
                valorHidraulicaEfetivo.textContent = indicadores.hidraulica.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorHidraulicaEfetivo.textContent = indicadores.hidraulica.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            if (e.entradaSaida.categoria == "Elétrica") {
                e.valorEfetivo? advertencias.eletrica = true: advertencias.eletrica = false;
                indicadores.eletrica.Efetivo += e.valorEfetivo? e.valorEfetivo: 0;
                valorEletricaEfetivo.textContent = indicadores.eletrica.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            }else valorEletricaEfetivo.textContent = indicadores.eletrica.Efetivo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }
    })

    indicadores.adiantamentos.total = (indicadores.adiantamentos.Estimado - indicadores.adiantamentos.Efetivo);
    if(indicadores.adiantamentos.total > 0){
        valorValeTotal.textContent = `de economia: ${indicadores.adiantamentos.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else if(indicadores.adiantamentos.total < 0){
        valorValeTotal.textContent = `de prejuízo: ${indicadores.adiantamentos.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else{
        valorValeTotal.innerText = "Meta Atingida!"
    }
    
    indicadores.geral.total = (indicadores.geral.Estimado - indicadores.geral.Efetivo);
    if(indicadores.geral.total > 0){
        valorGeralTotal.textContent = `de economia: ${indicadores.geral.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else if(indicadores.geral.total < 0){
        valorGeralTotal.textContent = `de prejuízo: ${indicadores.geral.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else{
        valorGeralTotal.innerText = "Meta Atingida!"
    }
    
    
    indicadores.combustivel.total = (indicadores.combustivel.Estimado - indicadores.combustivel.Efetivo);
    if(indicadores.combustivel.total > 0){
        valorCombustivelTotal.textContent = `de economia: ${indicadores.combustivel.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else if(indicadores.combustivel.total < 0){
        valorCombustivelTotal.textContent = `de prejuízo: ${indicadores.combustivel.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else{
        valorCombustivelTotal.textContent = "Meta Atingida!"
    }
    
    indicadores.salarios.total = (indicadores.salarios.Estimado - indicadores.salarios.Efetivo);
    if(indicadores.salarios.total > 0){
        valorSalarioTotal.textContent = `de economia: ${indicadores.salarios.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else if(indicadores.salarios.total < 0){
        valorSalarioTotal.textContent = `de prejuízo: ${indicadores.salarios.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else{
        valorSalarioTotal.textContent = "Meta Atingida!"
    }
    
    indicadores.vt.total = (indicadores.vt.Estimado - indicadores.vt.Efetivo);
    if(indicadores.vt.total > 0){
        valorVtTotal.textContent = `de economia: ${indicadores.vt.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else if(indicadores.vt.total < 0){
        valorVtTotal.textContent = `de prejuízo: ${indicadores.vt.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else{
        valorVtTotal.textContent = "Meta Atingida!"
    }
    
    indicadores.vr.total = (indicadores.vr.Estimado - indicadores.vr.Efetivo);
    if(indicadores.vr.total > 0){
        valorVrTotal.textContent = `de economia: ${indicadores.vr.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else if(indicadores.vr.total < 0){
        valorVrTotal.textContent = `de prejuízo: ${indicadores.vr.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else{
        valorVrTotal.textContent = "Meta Atingida!"
    }
    
    indicadores.gas.total = (indicadores.gas.Estimado - indicadores.gas.Efetivo);
    if(indicadores.gas.total > 0){
        valorGasTotal.textContent = `de economia: ${indicadores.gas.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else if(indicadores.gas.total < 0){
        valorGasTotal.textContent = `de prejuízo: ${indicadores.gas.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else{
        valorGasTotal.textContent = "Meta Atingida!"
    }
    
    indicadores.eletrica.total = (indicadores.eletrica.Estimado - indicadores.eletrica.Efetivo);
    if(indicadores.eletrica.total > 0){
        valorEletricaTotal.textContent = `de economia: ${indicadores.eletrica.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else if(indicadores.eletrica.total < 0){
        valorEletricaTotal.textContent = `de prejuízo: ${indicadores.eletrica.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else{
        valorEletricaTotal.textContent = "Meta Atingida!"
    }
    
    indicadores.hidraulica.total = (indicadores.hidraulica.Estimado - indicadores.hidraulica.Efetivo);
    if(indicadores.hidraulica.total > 0){
        valorHidraulicaTotal.textContent = `de economia: ${indicadores.hidraulica.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else if(indicadores.hidraulica.total < 0){
        valorHidraulicaTotal.textContent = `de prejuízo: ${indicadores.hidraulica.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    }else{
        valorHidraulicaTotal.textContent = "Meta Atingida!"
    }
    
    setTimeout(()=>{

        if(advertencias.geral){
            advertenciaGeral.style.display = "none";
        }
        if(advertencias.combustivel){
            advertenciaCombustivel.style.display = "none";
        }
        if(advertencias.gas){
            advertenciaGas.style.display = "none";
        }
        if(advertencias.eletrica){
            advertenciaEletrica.style.display = "none";
        }
        if(advertencias.hidraulica){
            advertenciaHidraulica.style.display = "none";
        }
        if(advertencias.salarios){
            advertenciaSalario.style.display = "none";
        }
        if(advertencias.vt){
            advertenciaVt.style.display = "none";
        }
        if(advertencias.vr){
            advertenciaVr.style.display = "none";
        }
        if(advertencias.adiantamentos){
            advertenciaAdiantamento.style.display = "none";
        }
    }, 300)
    setTimeout(() => {        
        console.log(indicadores)
        console.log(advertencias)
    }, 500);
}
*/