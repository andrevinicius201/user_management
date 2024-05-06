const express = require('express')
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require('body-parser');
const UserRepository = require('./user-repository')

const app = express()
const port = 3000

let userRepository;
let client;
let connected = false;

app.use(bodyParser.json())

app.use(async (req, res, next) => {
    if(!connected){

        const uri = 'mongodb://localhost:27017/'
        client = new MongoClient(uri)
        await client.connect()
        const collection = client.db('users_db').collection('users')
        userRepository = new UserRepository(collection)
        connected = true
    }
    next()
})

app.get('/users', async(request, response) => {
    const users = await userRepository.findAll()
    response.status(200).json(users)
})

app.get('/users/:id', async(request, response) => {
    try {
        const user = await userRepository.findOneById(ObjectId(request.params.id))
        response.json(user)
    } catch (e) {
        response.status(404).send()
    }
})

app.post('/users', async(request, response) => {
    const user = await userRepository.insert(request.body)
    response.status(201).json(user)
})


module.exports = app;