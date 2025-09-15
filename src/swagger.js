// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Radio Display API',
      version: '1.0.0',
      description: 'Documentation for the Radio Display API',
    },
  },
  apis: [__dirname + '/index.js'], // Point to your route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;