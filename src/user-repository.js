class UserRepository {
    constructor(collection){
        this.collection = collection
    }

    async findOneByEmail(email){
        const user =  await this.collection.findOne({email})

        if(user == null){
            throw new Error("User with specified e-mail does not exist")              
        }
        return user
    }

    async findOneById(id){
        const user =  await this.collection.findOne({_id: id});

        if(user === null){
            throw new Error("User with specified id does not exist")              
        }
        
        return user;
    }

    async insert(user){
        await this.collection.insertOne(user)
        return user
    }

    async delete(id){
        await this.collection.deleteOne({_id: id})
    }

    async findAll(){
        return await this.collection.find().toArray()

    }
};

module.exports = UserRepository