[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=11679466&assignment_repo_type=AssignmentRepo)

# Auth Server 

## Requirements
1. **Node version** >= 20.6
2. **Nodemon** installed
    a. If nodemon is not installed, run `$ npm install -g nodemon` or `$ yarn global add nodemon`
3. Create db with name 'auth' in mysqlserver

## Run Instructions
After cloning the repo, run `$ npm install` to install the dependencies.

To launch the app, run `$ npm start` in your terminal, app will be hosted on `localhost:3001`

## Run Test Instructions
**With docker:**

 **To start:** 
```
$ docker compose -f ci/compose.test.yaml up --build
``` 
 
 **After completing:** 
 ```
$ docker compose -f ci/compose.test.yaml down
```

**Without docker:**
```
$ npm test
```

## AWS IAM Role: 
(AWSACCESSKEYID, AWSSECRETACCESSKEY)

Steps:
1. Go to AWS IAM.
2. Create a new user and apply the policy: **AmazonSESFullAccess**
3. After creating the user, copy the **ACCESSKEY** and **SECRETACCESSKEY** and paste the value into the env file.

## Generation of CERT and PRI Keys

**Steps**:
1. Open up Terminal, and using openSSL, enter the following 2 commands:
```
$ openssl req -x509 -newkey rsa:2048 -keyout privateKey.pem -out cert.pem -days 365
```
```
$ openssl rsa -in privateKey.pem -out privateKeyNoPassphrase.pem
```
2. rename the privateKeyNoPassphrase.pem to privateKey.pem
3. Add the privateKey.pem into github repo secret as **BE_PRIVATEKEY_PEM**
4. Add the cert.pem into github repo secret as **BE_CERT_PEM**


**To run locally**:
1. `npm install`
2. copy the `template.env` contents into a `.env` file and change the appropriate details To launch the app
3. `npm start`

**Endpoint**: `http://localhost:3001/health`  should be up and running

# Frontend UI for testing current setup
**Create a `.env` file and copy `template.env` into it: Make the required changes**
**VITE_BACKEND_URL** = `http://localhost:3001` (address of the above BE endpoint)

**To run locally:**
1. `npm install`
2. copy the `template.env` contents into a `.env` file and change the appropriate details To launch the app
3. `npm run dev`

**To build:**
```
$ npm run build
```

**To preview:**
```
$ npm run preview
```

**Login Credentials (Testing purpose)**
Administrator:
email: demoadmin@example.com
password: password

Moderator:
email: demomod@example.com
password: password

User:
email: demouser@example.com
password: password


## Steps to deploy in another region (using Terraform)

Establish two additional Amazon Elastic Container Registry (ECR) repositories in the alternate region—one for the front-end image and another for the back-end image. When configuring options, ensure Tag immutability is set to disabled and activate KMS encryption. Take note of the names assigned to the front-end and back-end ECR repositories, as they will be referenced in the subsequent Terraform script.

Create an `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
Once done, on your local machine, set both variables to the respective values.

**Windows**
```
$ set AWS_ACCESS_KEY_ID=xxx
$ set AWS_SECRET_ACCESS_KEY=xxx
```

**Mac**
```
$ export AWS_ACCESS_KEY_ID=xxx
$ export AWS_SECRET_ACCESS_KEY=xxx

```

Navigate to the directory where the terraform script `main.tf` is included (/terraform).
Terraform commands (in order)

- `$ terraform init` to initialise terraform and connect to the cloud provider
- `$ terraform fmt` to format files
- `$ terraform plan` to gloss over changes made to make sure nothing will break
- `$ terraform apply` to deploy on AWS
- `$ terraform show` to show the current state of deployed resources
- `$ terraform destroy` to all terminate instances
- `$ terraform destroy -target='<resource>.<name>'` to destroy specific instances
- `$ terraform state list` to view all managed states
- `$ terraform state rm <resource>.<name>` to remove state from tf state

To deploy in another region, change the following:
1. Region of  `provider`
2. Availability zone of `aws_subnet`
3. Image url of  `aws_ecs_task_definition`
4. Region of  `awslogs-region` under `aws_ecs_task_definition`
5. Region of  `aws_cloudfront_distribution` origin_shield_region parameter

Upon completion of the initial setup, proceed to create an RDS MySQL database to serve as the data store. Take note of the Master username and Master password. When selecting the VPC, choose the "tf-vpc" created by Terraform, and for the VPC security group, opt for "tf-DB-SG" created by Terraform while keeping other settings as default.

Update the environment for the backend host to reflect the created database URL. Navigate to CloudFront in AWS to retrieve the domain name for the backend URL (e.g., https://xxxxx.cloudfront.net), and modify the environment variable in the front end to set VITE_BACKEND_URL to https://xxxxx.cloudfront.net.

To build and push the image into ECR, refer to the provided guide. Execute the commands in the "initial-app" folder for the front end and in the "auth-server" folder for the back end. Image tagging convention involves using "latest" as the image tag.

Once the images are successfully in ECR, access ECS clusters and choose "tf-ecs-cluster." In the services section, click into each service, select "Update Service," and enable the "force new deployment" option before clicking "Update" at the bottom.

After confirming that all tasks are running, visit CloudFront to obtain the frontend URL, which should now be accessible.

