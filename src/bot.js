const { ActivityHandler, StatusCodes } = require('botbuilder')
const log = require('lambda-log')

const db = require('./database')
const { Opcao1 } = require('./dialogs')

const LINE_BREAK = "\n"
const isInLambda = !!process.env.LAMBDA_TASK_ROOT

class Bot extends ActivityHandler {
    constructor() {
        super();
        this.data = {}
        this.onMessage(async (context, next) => {
            const { actionType } = context.activity.channelData

            if (actionType === "start-conversation") {
                // Quando há um start-conversation
                const {
                    conversationId,
                    transfer_to: transferTo,
                    close: closeUrl,
                    ticket: ticketId,
                    token,
                    start_message: startMessage,
                    cookie,
                    message_url: messageUrl
                } = context.activity.channelData

                const conversationData = {
                    conversationId,
                    transferTo,
                    closeUrl,
                    ticketId,
                    token,
                    startMessage,
                    cookie,
                    messageUrl
                }

                this.flow = {
                    passoAtual: 'consentimento_dados_pessoais',
                    tentativas: 0
                }

                this.userData = {
                    contactName: context.activity.from.name,
                    contactPhoneNumber: context.activity.from.id,
                }

                this.data = {}          

                this.data['conversationData'] = conversationData
                this.data['conversationId'] = conversationId
                this.data['flow'] = this.flow
                this.data['userData'] = this.userData

                context.activity.channelData = conversationData;

                log.debug(JSON.stringify({
                    'close_url': closeUrl,
                    'trasnfer_url': transferTo,
                    'cookie': cookie,
                    'token': token,
                    'contact': this.userData
                }))
                await context.sendActivity(
                    `Ola ${this.userData.contactName}, Bem vindo ao atendimento inteligente do programar`
                )
                await this.actStepMenuInicial(context)

                const { rows, rowCount } = await db.query('select * from messages where id=$1', [conversationId])
                if (rowCount != 0) {
                    log.info('conversa já existe no banco de dados')
                    await db.query(
                        'update messages set flow=$1 where id=$2',
                        [
                            this.flow,
                            conversationId,
                        ]
                    )
                } else {
                    await db.query(
                        'insert into messages (id, conversation_data, flow, user_data) values ($1, $2, $3, $4)',
                        [
                            conversationId,
                            conversationData,
                            this.flow,
                            this.userData
                        ]
                    )
                }
            } else if (actionType === "message") {
                
                const { conversationId } = context.activity.channelData
                const { rows, rowCount } = await db.query('select * from messages where id=$1', [conversationId])

                if (rowCount === 0) {
                    context.turnState.set("httpStatus", StatusCodes.BAD_REQUEST)
                    context.turnState.set("httpBody", {
                        "error": true,
                        "message": "Essa conversa ainda não foi inicializada no bot."
                    })

                    return
                }

                const messageData = rows[0]

                if (messageData['closed_in']) {
                    context.turnState.set("httpStatus", StatusCodes.BAD_REQUEST)
                    context.turnState.set("httpBody", {
                        "error": true,
                        "message": "Essa conversa já foi foi encerrada."
                    })

                    return
                }

                if (messageData['transfered_in']) {
                    context.turnState.set("httpStatus", StatusCodes.BAD_REQUEST)
                    context.turnState.set("httpBody", {
                        "error": true,
                        "message": "Essa conversa já foi foi transferida pro atendimento."
                    })

                    return
                }
                
                context.activity.channelData = messageData['conversation_data']

                this.data['conversationId'] = conversationId
                this.data['conversationData'] = messageData['conversation_data']
                this.data['flow'] = messageData['flow']
                this.data['userData'] = messageData['user_data']
                this.data['lastInteraction'] = messageData['last_interaction']
                this.data['startedIn'] = messageData['started_in']
                this.data['transferredIn'] = messageData['transfered_in']
                this.data['closedIn'] = messageData['closed_in']

                this.flow = messageData['flow']
                this.userData = messageData['user_data']

                this.flow.respostaUsuario = true

                await this.handleBotMessage(context)
                console.log(this.flow);
                await db.query(
                    'update messages set flow=$1, user_data=$2, last_interaction=$3 where id=$4',
                    [
                        this.flow,
                        this.userData,
                        new Date(),
                        conversationId
                    ]
                )
            }

            await next()
        })
    }

    async handleBotMessage(context) {
        // if (["transferir"].includes(context.activity.text.toLowerCase())) {
        //     await context.sendActivity('Conforme sua solicitação, estarei te transferindo para um atendente, por favor aguarde!')

        //     await this.transferConversation(context.activity, context)
        //     return
        // }

        if (["encerrar"].includes(context.activity.text.toLowerCase())) {
            await context.sendActivity('Conforme sua solicitação, encerrarei essa conversa.')

            await this.closeConversation(context)
            return
        }
        
        if (this.flow.passoAtual === 'confirmacao_menu') {
            await this.actStepConfirmacaoMenuInicial(context)
        }

        if (this.flow.currentFlow === 'opcao1') {
           const opcao1 = new Opcao1(this, context)
            opcao1.run()
        }

        /* if (this.flow.currentFlow === 'objeto') {
           const objeto = new Objeto(this, context)
            objeto.run
        } */

        !isInLambda && console.log(this.flow)
    }


    async actStepMenuInicial(context) {
        if (this.flow.respostaUsuario) return

        await context.sendActivity(
            'Primeiro menu selecione uma das 3 opções abaixo:\n'
            +LINE_BREAK
            +'1 - Opção 1\n'
            +'2 - Opção 2\n'
            +'3 - Opção 3\n'
        )

        this.flow.currentFlow = null
        this.flow.passoAtual = 'confirmacao_menu'
    }

    async actStepConfirmacaoMenuInicial(context) {
        if (!this.flow.respostaUsuario) return

        const respostaUsuario = context.activity.text
        const opcao1 = '1'
        const opcao2 = '2'
        const opcao3 = '3'

        switch (respostaUsuario) {
            case opcao1:
                this.flow.currentFlow = 'opcao1'
                this.flow.passoAtual = 'escolha_opcao1'
                this.flow.respostaUsuario = false

                break

            case opcao2:
                this.flow.currentFlow = 'opcao2'
                this.flow.passoAtual = 'confirmacaoRepresentante'
                this.flow.respostaUsuario = false
                break
            case opcao3:
                this.flow.currentFlow = 'opcao3'
                break
            default:
                const texto_invalido = (
                    'Não entendi, por favor escolha uma das opções novamente.'
                )
                await this.actRespostaInvalida(context, texto_invalido, texto_invalido)
        }
    }

    // -----
    // funções auxiliares para auxiliar no fluxo do bot
    // -----

    async actRespostaInvalida(context, texto_1_tentativa, texto_2_tentativa, texto_encerramento) {
        this.flow.tentativas += 1

        if (this.flow.tentativas === 1) {
            await context.sendActivity(texto_1_tentativa || 'Por favor, digite uma opção válida.')
        } else if (this.flow.tentativas === 2) {
            await context.sendActivity(texto_2_tentativa || 'O que você digitou não é válido, digite uma opção válida, por favor.')
        }

        // Se o utilizador tiver estrapolado a quantidade de tentativas, o atendimento será encerrado
        else {
            await context.sendActivity(
                texto_encerramento || (
                    'Desculpe, o que você digitou não é uma opção válida, então não vou conseguir continuar com '
                    + 'o atendimento. ☹️'
                    + LINE_BREAK
                    + 'Mas sempre que precisar é só entrar em contato com a gente.'
                )
            )
            await this.closeConversation(context)
        }
    }

    async transferConversation(context, transferirPara) {
        const campaigns = {}
        const campaign_default = process.env.CAMPAIGN_DEFAULT_ID

        let campaign_id = campaign_default;
        if (campaigns[transferirPara] !== undefined) {
            campaign_id = campaign_default
        }

        const activity = context.activity

        activity.type = 'Handoff'
        activity.code = campaign_id
        await context.sendActivity(activity)

        // data/hora de transferencia da conversa
        const transferredIn = new Date()

        // injeta no conversationSate
        this.data['transferredIn'] = transferredIn
        this.data['transferredTo'] = campaign_id

        // salva as alterações no banco de dados
        await db.query(
            'update messages set transfered_in=$1, transfered_to=$2, last_interaction=$1 where id=$3',
            [transferredIn, campaign_id, this.data['conversationId']]
        )
    }

    async closeConversation(context) {
        await context.sendActivity({
            type: 'EndOfConversation',
            code: 'solved'
        })

        // data/hora de encerramento da conversa
        const closedIn = new Date()

        // injeta no conversationSate
        this.data['closed'] = closedIn

        // salva as alterações no banco de dados
        await db.query(
            'update messages set closed_in=$1, last_interaction=$1 where id=$2',
            [closedIn, this.data['conversationId']]
        )
    }
}

module.exports.Bot = Bot