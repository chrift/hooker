"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const sendMessage = async (message, webhookUrl) => {
    await node_fetch_1.default(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify({ text: message })
    });
};
exports.default = {
    sendMessage
};
