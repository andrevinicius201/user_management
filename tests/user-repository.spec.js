const { MongoClient } = require("mongodb");
const UserRepository = require('../src/user-repository')

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

    describe('insert', () => {
        test('Deve inserir um novo usuário', async () => {

            const newUser = await userRepository.insert({
                name: "John Doe",
                email: "john@doe.com"
            })
           

            const foundUser = await userRepository.findOneByEmail("john@doe.com")
            
            expect(foundUser).toStrictEqual({
                _id: newUser._id,
                name: "John Doe",
                email: "john@doe.com"
            })
            
        })
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

    describe('update', () => {
        test('Deve atualizar um usuário existente', async() => {
            
            const newUser = await userRepository.insert({
                name: 'John Doe',
                email: 'john@doe.com'
            })

            await userRepository.update('john@doe.com', 'John Cena')
        
            const result = await userRepository.findOneByEmail(newUser.email)
            expect(result).toStrictEqual({
                _id: newUser._id,
                name: 'John Cena',
                email: 'john@doe.com'
            })
        })
        test('Deve lançar uma exceção para um usuário não existente', async() => {
            await expect(userRepository.update('teste@teste.com', 'John Cena')).rejects.toThrow('User with specified e-mail does not exist')
        })
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
        test('Deve lançar uma exceção para um usuário não existente', async() => {
            await expect(userRepository.delete('john@doe.com')).rejects.toThrow('Specified user was not found')
        })
    })

    describe('findAll', () => {
        test('Deve retornar uma lista vazia de usuários', async() => {
            const users = await userRepository.findAll()
            expect(users).toStrictEqual([])
        })

        test('Deve retornar uma lista contendo dois usuários', async() => {
            const firstUser = await userRepository.insert({
                name: 'John Doe',
                email: 'john@doe'
            })
            const secondUser = await userRepository.insert({
                name: 'John Cena',
                email: 'john@cena'
            })
            const users = await userRepository.findAll()
            expect(users).toStrictEqual([
                {
                    _id: firstUser._id,
                    name: 'John Doe',
                    email: 'john@doe'
                },
                {
                    _id: secondUser._id,
                    name: 'John Cena',
                    email: 'john@cena'
                }
            ])
        })
    })
})