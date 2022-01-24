function adicionaZero(numero) {
    if (numero <= 9)
        return "0" + numero;
    else
        return numero;
}

function dataFormatada(data) {
    return adicionaZero(data.getDate()).toString()
        + '/'
        + adicionaZero((data.getMonth() + 1)).toString()
        + '/'
        + data.getFullYear()
}

function calculaPeriodo(data) {
    const hora = data.getHours()
    const minuto = data.getMinutes()
    let periodo = ''

    if (hora < 6 || (hora === 6 && minuto === 0)) {
        periodo = 'madrugada'
    } else if (hora < 12 || (hora === 12 && minuto === 0)) {
        periodo = 'manhã'
    } else if (hora < 18 || (hora === 18 && minuto === 0)) {
        periodo = 'tarde'
    } else {
        periodo = 'noite'
    }

    return periodo
}

module.exports = {
    adicionaZero,
    dataFormatada,
    calculaPeriodo
}