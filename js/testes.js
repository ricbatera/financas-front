const resultados = [
    {
        id: 1,
        descricao: "Item 01",
        parcelas: [
            {
                id: 1,
                dataVencimento: '2022-01-20'
            },
            {
                id: 2,
                dataVencimento: '2022-02-20'
            },
            {
                id: 1,
                dataVencimento: '2022-03-20'
            }
        ]
    },
    {
        id: 2,
        descricao: "Item 02",
        parcelas: [
            {
                id: 1,
                dataVencimento: '2022-01-20'
            },
            {
                id: 2,
                dataVencimento: '2022-02-20'
            },
            {
                id: 1,
                dataVencimento: '2022-03-20'
            }
        ]
    },
    {
        id: 3,
        descricao: "Item 03",
        parcelas: [
            {
                id: 1,
                dataVencimento: '2022-01-20'
            },
            {
                id: 2,
                dataVencimento: '2022-02-20'
            },
            {
                id: 1,
                dataVencimento: '2022-03-20'
            }
        ]
    }
]
let hoje = '2022-01-01'
resultados.forEach(e=>{
    console.log(e.id)
    // e.forEach(el=> console.log(el))
})