const helmet = require('helmet')
const nocache = require('nocache');
module.exports = (app) =>{
    app.use(
        helmet({
          xContentTypeOptions: 'nosniff',
          xXssProtection: true,
          xPoweredBy: false,
        })
      );
    app.use((req, res, next)=> {
      res.setHeader( 'X-Powered-By', 'PHP 7.4.3' );    
      next()
    })
}
