var config = {};
//Heroku assigns the value through the PORT environment variable. You cannot choose
config.port = process.env.HTTP_PORT || process.env.PORT || 3000;
module.exports = config;