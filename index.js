import express from 'express'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { io } from 'socket.io-client'
import { socketServer } from './config.js'

const app = express()
const server = createServer(app)
const webSocketServer = new WebSocketServer({ server })
const clientSocket = io(socketServer)

app.get('/', (req, res) => {
    return res.send('Api working')
})

webSocketServer.on('connection', (ws) => {
    let timeout = setTimeout(() => {
        ws.isAlive = false
    }, 10000)
    ws.on('open', () => {
        console.log('connected ws')
    })
    ws.on('error', console.warn)
    clientSocket.onAny((event, ...args) => {
        const eventData = {
            event,
            args
        }
        ws.send(JSON.stringify(eventData))
    })
    ws.on('message', (data) => {
        clearTimeout(timeout)
        clientSocket.send(data)
        timeout = setTimeout(() => {
            ws.isAlve = false
        }, 10000)
    })
})

server.listen(8000, () => {
    console.log('server running at port 8000')
})
