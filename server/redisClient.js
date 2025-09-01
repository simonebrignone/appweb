const { createClient } = require('redis');

const redisClient = createClient({
  url: 'redis://redis:6379'
});

redisClient.on('error', (err) => {
  console.error('Errore nella connessione a Redis:', err);
});

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Connesso a Redis!');
  } catch (err) {
    console.error('❌ Errore connessione Redis:', err);
  }
})();

module.exports = redisClient;
