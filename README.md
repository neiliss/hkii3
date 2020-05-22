May 12 2020

Hacking in isolation - Deploy multi tier app and services to TAS
By Neil Isserow
Customer Success Manager - MAPBU
May 2020

Scenario:
We will deploy an application that consists of a number of components to TAS. These components are as follows:

Front End - Web based application
Back End - MongoDB Database
Web Services - communicate internally securely via route

The simple application we will use is a modified NodeJS application that can be found here: https://pallabpain.wordpress.com/2017/03/12/getting-started-with-cloud-foundry/ 

The instructions on the website are pretty clear but for reference purposes here are the steps:

Log into your PWS or other TAS/PAS instance (we will use the free PWS at run.pivotal.io where you can register for a free account.

Download the CF CLI here - https://docs.cloudfoundry.org/cf-cli/install-go-cli.html
For MacOS - brew install cloudfoundry/tap/cf-cli

Login:
cf login -a https://api.run.pivotal.io

Login with your username/password combination

Download/git clone the sample app from here: https://github.com/pallabpain/userStory

git clone https://github.com/pallabpain/userStory.git

Create a manifest.yml

nano manifest.yml

Add the following (changing the name to something unique)

---
applications:
- name: userStory
  memory: 128MB
  instances: 1

Run CF Push

cf push

The application should go through all of the staging and deployment and once completed we should have a healthy running application.

Let’s check the app:

cf apps

We should see a configured route let’s open this in our web browser. It should bring up a web page and look good, however the application is not complete.

What we have is a deployment that now requires wiring up to a database as you can see to store/retrieve values.

Lets see what services we have available by running:

cf marketplace

We create a service for MongoDB to wire this application up as follows

cf create-service mlab sandbox mymongo

Now we can check the service we created

cf services

We now need to bind our application to this new service that has been created, bear in mind this could have been performed by the operator as well prior.

We add this to our manifest.yml

nano manifest.yml 

services:
- mymongo

We need to push the application again so that we are able to bind it and get back the correct environment variables.

cf push

Once it is completed lets get the variables which will provide us with what we need for the new database.

cf env <app-name>

Open the config.js and change as follows

nano config.js

var vcapServices = require('vcap_services');
var credentials = vcapServices.getCredentials('mlab');

module.exports = {
   "database": credentials.uri,
   "port": process.env.PORT || 3000,
   "secretKey": "aquaSurfer"
}

Then push the app again

cf push

We should now have our app up and running.
Lets head back to the web and sign up and check it all works.
We can do a few other things here like scale the app:
cf scale <your-app-name> -i <num_instances>
cf scale <your-app-name> -m <memory_size>
cf scale <your-app-name> -k <disk_size>
cf delete <your-app-name>

Let’s summarize:
We have a very simple application that is built in Nodejs.
The application has a front end which the user interacts with via their browser.
The application connects to a back end mongodb database.
The database is connected using environment variables in the application.
The database is provided during the deployment process or prior via the operator.
The environment variables can then be used for seamless connectivity.
No user/password information is passed publicly.
The application can easily be scaled for the main application.
The back end database is managed and can also be upgraded/managed by the application or operator.

Web Service Section

Let’s deploy our Heroes and Threats app again but this time use internal routing for the 
Threats -> Heroes web service.

download the app from git
git clone git@github.com:neiliss/hkii3.git

CF Push the heroes and threats app and ensure they work

Check Heroes
curl -i --request GET heroes.cfapps.io/heroes

Check Threats which will call heroes.cfapps.io
curl -i --request POST --header "Content-Type: application/json" --data '{"heroId": 2, "threatId": 1}' threats-svc.cfapps.io/assignment

Create an internal route
cf map-route heroes apps.internal --hostname heroes
cf apps will show you that heroes now has 2 routes

Modify Threats
Open threats.js
Change the Heroes URL from heroes.cfapps.io to heroes.apps.internal
cf push

Delete the heroes public route
cf delete-route cfapps.io --hostname heroes

Test the public route no longer works
curl -i --request GET heroes.cfapps.io/heroes

Test the Threats app still works
curl -i --request POST --header "Content-Type: application/json" --data '{"heroId": 2, "threatId": 1}' threats-svc.cfapps.io/assignment

