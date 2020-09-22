import fetch from 'node-fetch'

const sendMessage: Function = async <PromiseVoid>(message: string, webhookUrl: string) => {
    await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        body: JSON.stringify({ text: message })
    })
}

export default {
    sendMessage
}
