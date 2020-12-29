import mongoose from 'mongoose'

const database = 'mongodb://localhost:27017/subscriptions';

mongoose.createConnection(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const schema = new mongoose.Schema({ 
    hash: 'string',
    subscriptionEl: {
        endpoint: 'string',
        expirationTime: 'string',
        keys: {
            p256dh: 'string',
            auth: 'string'
        }
    }
});

const Subscription = mongoose.model('Subscription', schema);

export { Subscription };