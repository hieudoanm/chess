const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
const { convert } = require('swagger2-to-postmanv2');

const convertSync = (swaggerJson) => {
  return new Promise((resolve, reject) => {
    convert(swaggerJson, {}, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  });
};

const main = async () => {
  try {
    console.log(__dirname);
    const swaggerFilePath = path.join(__dirname, '../../docs/swagger.json');
    console.log('swagger file path', swaggerFilePath);
    const swaggerString = readFileSync(swaggerFilePath, 'utf-8');
    const swaggerJson = JSON.parse(swaggerString);
    console.log('swagger.json', swaggerJson);
    const postmanResult = await convertSync({
      type: 'json',
      data: { ...swaggerJson, swagger: '2.0' },
    });
    console.log('postman result', postmanResult);
    const { result, output = [] } = postmanResult;
    if (!result) return;
    for (const collection of output) {
      const postmanFilePath = path.join(
        __dirname,
        '../../docs/postman_collection.json'
      );
      console.log('postman file path', postmanFilePath);
      const { type, data } = collection;
      if (type === 'collection') {
        writeFileSync(postmanFilePath, JSON.stringify(data, null, 2));
      }
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
