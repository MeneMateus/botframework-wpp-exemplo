function calculaTipoProcesso(questionario) {
    const { possuiAgua, vizinhos_com_mesmo_problema, situacao_cavalete, situacao_normalizada } = questionario
    let tipoProcesso = ''

    if (possuiAgua === '1' && vizinhos_com_mesmo_problema === '1') {
        tipoProcesso = 'falta_agua_geral'
    } else if (possuiAgua === '1' && vizinhos_com_mesmo_problema === '2' && situacao_cavalete === '1') {
        tipoProcesso = 'falta_agua_local'
    } else if (possuiAgua === '2' && vizinhos_com_mesmo_problema === '1') {
        tipoProcesso = 'pouca_pressao_geral'
    } else if (possuiAgua === '2' && vizinhos_com_mesmo_problema === '2' && situacao_cavalete === '1') {
        tipoProcesso = 'pouca_pressao_local'
    } else if (possuiAgua === '2' && vizinhos_com_mesmo_problema === '1' && situacao_cavalete === '2' && situacao_normalizada === '2') {
        tipoProcesso = 'pouca_pressao_local'
    } else if (possuiAgua === '2' && vizinhos_com_mesmo_problema === '2' && situacao_cavalete === '2' && situacao_normalizada === '2') {
        tipoProcesso = 'pouca_pressao_local'
    }

    return tipoProcesso
}

const mapDescricaoProcesso = {
    'pouca_pressao_local': 'Pouca Pressão Local',
    'pouca_pressao_geral': 'Pouca Pressão Geral',
    'falta_agua_local': 'Falta de Água Local',
    'falta_agua_geral': 'Falta de Água Geral',
}

const mapTipoProcesso = {
    'pouca_pressao_local': '1120',
    'pouca_pressao_geral': '1110',
    'falta_agua_local': '1060',
    'falta_agua_geral': '1050',
}

module.exports = {
    calculaTipoProcesso,
    mapDescricaoProcesso,
    mapTipoProcesso
}