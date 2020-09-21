// curl -X POST -H 'Content-type: application/json' --data '{"text":"Hello, World!"}' https://hooks.slack.com/services/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
import fetch from 'node-fetch'

const sendMessage: Function = async <PromiseVoid>(message: string) => {
    await fetch('https://hooks.slack.com/services/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', {
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
