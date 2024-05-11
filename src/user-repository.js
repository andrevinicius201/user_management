class UserRepository {
    constructor(collection){
        this.collection = collection
    }

    async findOneByEmail(email){
        const user = await this.collection.findOne({email})

        if(user == null){
            throw new Error("User with specified e-mail does not exist")              
        }
        return user
    }

    async findOneById(id){
        const user = await this.collection.findOne({_id: id});

        if(user === null){
            throw new Error("User with specified id does not exist")              
        }
        
        return user;
    }

    async insert(user){
        const result = await this.collection.findOne({email: user.email});
        
        if(result){
            throw new Error("The provided e-mail is already registered")              
        }

        await this.collection.insertOne(user)
        return user
    }

    async update(userEmail, newUserName){
        const user =  await this.collection.findOne({email: userEmail});
        if(user === null){
            throw new Error("User with specified e-mail does not exist")              
        }
        
        const filter = { email: userEmail }
        const updateOperation = { $set: { name:newUserName } }
        await this.collection.updateOne(filter, updateOperation)
    }

    async delete(id){
        const user = await this.collection.findOne({_id:id});
        if(user === null){
            throw new Error("Specified user was not found")              
        }
        await this.collection.deleteOne({_id: id})
    }

    async findAll(){
        return await this.collection.find().toArray()

    }
};

module.exports = UserRepository