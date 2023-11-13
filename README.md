[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=11679466&assignment_repo_type=AssignmentRepo)

# Auth Server 

## Requirements
1. **Node version** >= 20.6
2. **Nodemon** installed
    a. If nodemon is not installed, run $ npm install -g nodemon or $ yarn global add nodemon
3. Create db with name 'auth' in mysqlserver

## Run Instructions
After cloning the repo, run $ npm install to install the dependencies.

To launch the app, run $ npm start in your terminal, app will be hosted on localhost:3001

## Run Test Instructions
**With docker:**

 **To start:** docker compose -f ci/compose.test.yaml up --build 
 
 **After completing:** docker compose -f ci/compose.test.yaml down

**Without docker:**

 npm test

# AWS IAM Role: 
(AWSACCESSKEYID, AWSSECRETACCESSKEY)

Steps:
1. Go to AWS IAM.
2. Create a new user and apply the policy: **AmazonSESFullAccess**
3. After creating the user, copy the **ACCESSKEY** and **SECRETACCESSKEY** and paste the value into the env file.

# Generation of CERT and PRI Keys

**Steps**:
1. Open up Terminal, and using openSSL, enter the following 2 commands:
    a. openssl req -x509 -newkey rsa:2048 -keyout privateKey.pem -out cert.pem -days 365
    b. openssl rsa -in privateKey.pem -out privateKeyNoPassphrase.pem
2. rename the privateKeyNoPassphrase.pem to privateKey.pem
3. Add the privateKey.pem into github repo secret as **BE_PRIVATEKEY_PEM**
4. Add the cert.pem into github repo secret as **BE_CERT_PEM**


**To run locally**:
1. npm install
2. copy the template.env contents into a .env file and change the appropriate details To launch the app
3. npm start

**Endpoint**: http://localhost:3001/health  should be up and running

## Frontend for testing current setup
**Create a .env file and copy template.env into it: Make the required changes**
**VITE_BACKEND_URL*=http://localhost:3001 (address of the above BE endpoint)

**To run locally:**
1. npm install
2. copy the template.env contents into a .env file and change the appropriate details To launch the app
3. npm run dev

**To build:**
npm run build

**To preview:**
npm run preview



