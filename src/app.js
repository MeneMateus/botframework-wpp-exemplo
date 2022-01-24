const dotenv = require('dotenv')
const path = require('path')

const Sentry = require("@sentry/node")

const express = require('express')
const cors = require('cors')

const log = require('lambda-log')

const { MutantWhatsAdapter } = require('./mutant-whats')
const { Bot } = require('./bot')

// Import required bot configuration.
const ENV_FILE = path.join(path.dirname(__dirname), '.env')
dotenv.config({ path: ENV_FILE })

const app = express()

app.use(express.json())
app.use(cors({ origin: true }))

// Algumas vari veis de ambiente essenciais para o projeto
const isInLambda = !!process.env.LAMBDA_TASK_ROOT

// Configura o Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});

// Adaptador do Mutant Wahts para o Bot Framework
const mutantWhatsAdapter = new MutantWhatsAdapter({
    id: 'af3cc904-4bee-4c1c-ab91-dc6d3b781193',
    name: 'Sani'
})

// Em caso de erro no bot
mutantWhatsAdapter.onTurnError = async (context, error) => {
    await context.sendTraceActivity(
        "OnTurnError Trace",
        `${error}`,
        "https://www.botframework.com/schemas/error",
        "TurnError"
    )

    Sentry.captureException(error)
    log.error(error)

    // await context.sendActivity("The bot encountered an error or bug.")
    // await context.sendActivity("To continue to run this bot, please fix the bot source code.")
}

const bot = new Bot()

// -----
// rotas do bot
// -----

const botSabespRouter = express.Router()

botSabespRouter.post('/start-conversation', async (req, res) => {
    isInLambda && log.info("start-conversation")
    isInLambda && log.info('req.body', JSON.stringify(req.body))

    try {
        await mutantWhatsAdapter.processActivity(req, res, "start-conversation", async (context) => {
            await bot.run(context)
        })
    }
    catch (e) {
        isInLambda && Sentry.captureException(e)
        log.error(e)
    }
})

botSabespRouter.post('/message', async (req, res) => {
    isInLambda && log.info("message")
    isInLambda && log.info('req.body', JSON.stringify(req.body))

    try {
        await mutantWhatsAdapter.processActivity(req, res, "message", async (context) => {
            await bot.run(context)
        })
    }
    catch (e) {
        isInLambda && Sentry.captureException(e)
        log.error(e)
    }
})

app.use('/bot_ezfront_adama', botSabespRouter)

module.exports = app
