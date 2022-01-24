const fs = require('fs')

const LINE_BREAK = "\n"

class Opcao1 {
    constructor(bot, context) {
        this.bot = bot
        this.context = context
        this.api = bot.api
        this.flow = bot.flow
        this.userData = bot.userData
    }

    async run() {
        if(this.flow.passoAtual == 'escolha_opcao1') {
            await this.actStepEscolhaOpcao1(this.context)
        }
        if(this.flow.passoAtual == 'confirmacao_opcao1') {
            await this.actStepConfirmacaoOpcao1(this.context)
        }
    }

    async actStepEscolhaOpcao1(context) {
        if (this.flow.respostaUsuario) return

        const texto = (
            'Muito Obrigado você escolheu a opção 1'
        )

        await context.sendActivity(texto.trim())
        

        this.flow.passoAtual = 'confirmacao_opcao1'
        this.flow.respostaUsuario = false
        this.flow.tentativas = 0
    }

    async actStepConfirmacaoOpcao1(context) {
        if (!this.flow.respostaUsuario) return

        const opcao1 = '1'
        const opcao2 = '2'
        const opcao3 = '3'

        switch (context.activity.text) {
            case opcao1:
                this.flow.passoAtual = 'escreva o proximo passo'
                this.flow.tentativas = 0
                this.flow.respostaUsuario = false

                break

            case opcao2:
                this.flow.tentativas = 0
                this.flow.respostaUsuario = false
                this.flow.passoAtual = 'escreva o proximo passo'

                break

            case opcao3:
                this.flow.tentativas = 0
                this.flow.respostaUsuario = false
                this.flow.passoAtual = 'escreva o proximo passo'

                break
            
            default:
                await this.bot.actRespostaInvalida(context)
        }
    }

}

module.exports.Opcao1 = Opcao1;