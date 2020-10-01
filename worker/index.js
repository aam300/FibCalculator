const keys = require('./keys');
// IMPORT REDIS CLEINT
const redis = require('redis');
// breate redis client and pass object  and if lose connection try to conect 1ms
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const sub = redisClient.duplicate();
// function to calculate value
function fib(index){
if (index < 2) return 1;
return fib(index -1) + fib(index -2);
}

// watch for new values
sub.on('message', (channel, message) => {
    redisClient.hset('values',message, fib(parseInt(message)));
});

sub.subscribe('insert');