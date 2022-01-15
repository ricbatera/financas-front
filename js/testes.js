let  valor = '325.283,45';

let result = valor.replace(/(\d{0,3})(\.?)(\d+)(\,)(\d{2})/, "$1$3.$5");

console.log(result)