const axios = require('axios');
const FormData = require('form-data');
const log = require('lambda-log')

class MutantWhatsClient {
    constructor(settings, messagesURL, transferURL, closeURL) {
        // Token and cookie are for message sending only.
        this.token = settings.token;
        this.cookie = settings.cookie;

        this.messagesURL = messagesURL;
        this.transferURL = transferURL;
        this.closeURL = closeURL;

        this.debug = process.env.DEBUG === 'true'
        this.isInLambda = !!process.env.LAMBDA_TASK_ROOT
    }

    async sendMessage(messageData) {
        const axiosConfig = {
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Cookie": `${this.cookie}`,
                "Content-Type": "application/json"
            },
            url: this.messagesURL,
            method: "post",
            data: messageData,
        }

        this.isInLambda && log.debug("sendMessage. Axios Data:", JSON.stringify(axiosConfig));
        return await this._sendRequest(axiosConfig)
    }

    async sendAttachment(messageData, filecontent, filename) {
        const url = this.messagesURL.replace('/activities', '/upload')

        const formData = new FormData()

        formData.append('activity', JSON.stringify(messageData));
        formData.append('file', filecontent, { filename });

        const axiosConfig = {
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Cookie": `${this.cookie}`,
                ...formData.getHeaders()
            },
            url: url,
            method: "post",
            data: formData,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        }

        this.isInLambda && log.debug("sendAttachment. Axios Data:", JSON.stringify(axiosConfig));
        return await this._sendRequest(axiosConfig)
    }

    async sendTransferConversation(campaign_id) {
        const axiosConfig = {
            url: this.transferURL,
            method: 'put',
            data: { campaign_id },
            headers: {
                "Content-Type": "application/json"
            }
        }

        this.isInLambda && log.debug("sendTransferConversation. Axios Data:", JSON.stringify(axiosConfig))
        return await this._sendRequest(axiosConfig)
    }

    async sendCloseConversation(status = 'solved') {
        const axiosConfig = {
            url: this.closeURL,
            method: 'put',
            data: { status },
            headers: {
                "Content-Type": "application/json"
            }
        }

        this.isInLambda && log.debug("sendCloseConversation. Axios Data:", JSON.stringify(axiosConfig))
        return await this._sendRequest(axiosConfig)
    }

    async _sendRequest(axiosConfig) {
        await axios(axiosConfig)
            // .then(res => console.log(JSON.stringify(res.data)))
            // .catch(err => console.error(JSON.stringify(err)));
            .catch(err => log.error(err.message));
    }
}

module.exports.MutantWhatsClient = MutantWhatsClient