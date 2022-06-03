//get template name and date of templates
const {createClient} = require('redis');

  async function test(){
    const redisClient = createClient({
        socket:{
            port:6379,
            host:"127.0.0.1",
        },
      }
      );
     await redisClient.connect();
 const templateString = await redisClient.hGet('templatesByEmailMap', 'sarii96@hotmail.com-test3');
console.log(templateString);
}
test();