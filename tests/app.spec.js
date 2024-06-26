const request = require('supertest')
const app = require('../src/app')
const { MongoClient } = require("mongodb");
const UserRepository = require('../src/user-repository')


describe("UserApi", () => {

    
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

    describe("/users", () => {
        describe("GET /", () => {
            test("Deve retornar uma lista vazia de usuários", async () => {
                const response = await request(app).get('/users');
                expect(response.statusCode).toBe(200)
                expect(response.body).toStrictEqual([])
            })

            test("Deve retornar uma lista contendo dois usuários", async () => {
                const firstUser = await userRepository.insert({
                    name: 'John Doe',
                    email: 'john@doe.com'
                })

                const secondUser = await userRepository.insert({
                    name: 'Bob Doe',
                    email: 'bob@doe.com'
                })
                

                const response = await request(app).get('/users');
                expect(response.statusCode).toBe(200)
                expect(response.text).toStrictEqual(
                `[{"_id":"${firstUser._id}","name":"John Doe","email":"john@doe.com"},{"_id":"${secondUser._id}","name":"Bob Doe","email":"bob@doe.com"}]`
                )
            })

        })
    })

    describe("/users:id", () => {
        describe("GET/", () => {
            test("Deve retornar os dados de um usuário", async() => {

                const user = await userRepository.insert({
                    name: "John Doe",
                    email: "john@doe.com"
                })

                const response = await request(app).get(`/users/${user._id}`)
                    
                expect(response.statusCode).toBe(200)
                expect(response.body).toEqual(expect.objectContaining({
                    name: "John Doe",
                    email: "john@doe.com"  
                }));
                
            })

            test("Deve retornar status 404 para busca de usuário não existente", async () => { 
                const response = await request(app).get(`/users/6639631872c7dedbf2398fa8`)
                expect(response.statusCode).toBe(404)
                expect(response.body).toStrictEqual({
                    message: 'User not found',
                    code: 404
                })
            })
        })

        describe("/PUT/", () => {
            test("Deve atualizar os dados de um usuário", async() => {
                
                const newUser = await userRepository.insert({
                    name: 'John Doe',
                    email: 'john@doe.com'
                })

                const response = await request(app).put(`/users/${newUser.email}`).send({
                    name: 'Ronaldinho Gaucho',
                    email: 'ronaldinho@gaucho.com'
                });

                expect(response.statusCode).toBe(201);
                
            })
            test("Deve recusar a inclusão de usuários com e-mails duplicados", async() => {
                
                await userRepository.insert({
                    name: 'John Doe',
                    email: 'john@doe.com'
                })
                
                const response = await request(app).post(`/users`).send({
                    name: 'John Doe',
                    email: 'john@doe.com'
                });

                expect(response.statusCode).toBe(401);
    

            })
        })
        
        describe("/DELETE/:id", () => {
            test("Deve deletar um usuário", async() => {
                const newUser = await userRepository.insert({
                    name: 'John Doe',
                    email: 'john@doe.com'
                })

                const response = await request(app).delete(`/users/${newUser._id}`)

                expect(response.statusCode).toBe(204)
            })
            test("Deve retornar status 404 na tentativa de deleção de um usuário inexistente", async() => {
                const response = await request(app).delete(`/users/6639631872c7dedbf2398fa8`)
                expect(response.statusCode).toBe(404)
                expect(response.body).toStrictEqual({
                    message: 'User not found',
                    code: 404
                })
            })
        })
    })

    describe("POST /", () => {
        test("Deve incluir um usuário no banco de dados", async() => {
            const response = await request(app).post('/users').send({
                name: 'John Doe',
                email: 'john@doe.com'
            });

            expect(response.statusCode).toBe(201);

            const user = await userRepository.findOneByEmail('john@doe.com');

            expect(user).toEqual(expect.objectContaining({
                name: 'John Doe',
                email: 'john@doe.com'  
            }));
        })
        test("Não deve permitir a inclusão de usuários com e-mails duplicados", async() => {
            await userRepository.insert({
                name: 'John Doe',
                email: 'john@doe.com'
            })

            const response = await request(app).post('/users').send({
                name: 'John Doe',
                email: 'john@doe.com'
            });

            expect(response.statusCode).toBe(401);

        })
        // Criar o usuário antes de tentar inserir o mesmo e-mail novamente
        // Retornar status 400
    })


})