const { Pool } = require('pg')
const log = require('lambda-log')

const pool = new Pool()

pool.on('connect', () => {
    log.debug('Base de Dados conectado com sucesso!');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};