const { MongoClient } = require("mongodb");
const UserRepository = require('./user-repository')

describe('UserRepository', () => {

    let userRepository;
    let collection;
    let client;

    beforeAll(async () => {
        const uri = 'mongodb://localhost:27017/'
        client = new MongoClient(uri)
        await client.connect()
        collection = client.db('users_db').collection('users')
        userRepository = new UserRepository(collection)
    })

    afterAll(async () => {
        await client.close()
    })

    beforeEach(async () => {
        await collection.deleteMany({})
    })

    describe('findOneByEmail', () => {
        test('Deve retornar o usuário john@doe.com', async () => {
            const result = await collection.insertOne({
                name: 'John Doe',
                email: 'john@doe.com'
            })

            const user = await userRepository.findOneByEmail('john@doe.com')
            expect(user).toStrictEqual({
                _id: result.insertedId,
                name: 'John Doe',
                email: 'john@doe.com'
            })
        })
        test('Deve lançar uma exceção para um usuário não existente', async () => {
            await expect(userRepository.findOneByEmail('john@doe.com')).rejects.toThrow('User with specified e-mail does not exist')
        })
    })

    describe('insert', () => {
        test('Deve inserir um novo usuário', async () => {

            const user = userRepository.insert({
                name: "John Doe",
                email: "john@doe.com"
            })

            const result = userRepository.findOneByEmail("john@doe.com")
            
            expect(result).toStrictEqual(user)
            
        })
    })

    describe('update', () => {
        test.todo('Deve atualizar um usuário existente')
        test.todo('Deve lançar uma exceção para um usuário não existente')
    })

    describe('delete', () => {
        test('Deve remover um usuário existente', async() => {

            const user = await userRepository.insert({
                name: 'John Doe',
                email: 'john@doe.com'
            })


            await userRepository.delete(user._id)
            await expect(userRepository.findOneByEmail('john@doe.com')).rejects.toThrow()
        })
        test.todo('Deve lançar uma exceção para um usuário não existente')
    })

    describe('findAll', () => {
        test.todo('Deve retornar uma lista vazia de usuários')
        test.todo('Deve retornar uma lista contendo dois usuários')
    })
})