# Requirements

1. Node version >= 20.6
2. Nodemon installed
   - If nodemon is not installed, run `$ npm install -g nodemon` or `$ yarn global add nodemon`
3. Create db with name 'auth' in mysqlserver
4. Make a copy of template.env into a .env file and change the necessary values

# Run instructions

After cloning the repo, run `$ npm install` to install the dependencies.

To launch the app, run `$ npm start` in your terminal, app will be hosted on `localhost:3001`


# Run test instructions

With docker 
To start:
docker compose -f ci/compose.test.yaml up --build
After completing:
docker compose -f ci/compose.test.yaml down

Without docker
npm test