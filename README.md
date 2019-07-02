# heartbeat-kubernetes
It is a measurement and analytic system for heart beat in order to help managing health.  
<img src="https://user-images.githubusercontent.com/52392004/60531757-9b407b80-9d36-11e9-889e-d779216f76c5.png" width="90%"></img>  

At first, I used the connection directly. But I realized it needs to manage the connection between the application and mysql server.  
So, I recommend to use myconnection (https://www.npmjs.com/package/express-myconnection)  
  
the case of directly connection which has a problem to sustain the connection  
```c
const express = require('express');
// Create connection
var mysql      = require('mysql');
var db = mysql.createConnection(config);
// Connect
db.connect( (err) => {
    if(err) { throw err; }
    console.log('MySQL Connected...');
});  
```

You can manage the connection as bellow:  
##### single - creates single database connection for an application instance. Connection is never closed. In case of disconnection it will try to reconnect again as described in node-mysql docs.  
##### pool - creates pool of connections on an app instance level, and serves a single connection from pool per request. The connections is auto released to the pool at the response end.  
##### request - creates new connection per each request, and automatically closes it at the response end.   

```c
var myConnection  = require('express-myconnection')  
app.use(myConnection(mysql, dbOptions, 'pool'))  
```

# Guide  
install guide for kubernetes infra structure  

### create hearbeat cluster based on EKS  
$ eksctl create k8s/cluster -f cluser.yaml  

# MySQL  
It is used for the storage of mysql but it will be moved to a managed storage in order to move a production level later.  
### allocate a persistent volume  
$ kubectl create -f k8s/mysql/local-volumes.yaml  
$ kubectl create -f k8s/mysql/mysql-pv-claim.yaml  
### create mysql  
$ kubectl create -f k8s/mysql/mysql.yaml  
$ kubectl create -f k8s/mysql-service.yaml  
#### [Reference](https://github.com/hongjsk/spring-petclinic-kubernetes/tree/master/k8s/mysql)  
#### Setup the database in .bashrc  
export DB_HOST='abcedfefewfdfdfdf-158449500.eu-west-2.elb.amazonaws.com';  
export DB_USER='root';  
export DB_PASS='passwd';  
export DB_NAME='database';  


### create mysql-credential Secret  
$ kubectl create secret generic mysql-credential --from-file=./username --from-file=./password  
### set configmap  
$ kubectl create -f k8s/mysql-configmap.yaml  
### get the public ip address or domain  
$ kubectl get service -o wide  
### check the connectivity of mysql using the earn address of the mysql server  
$ mysql -h [server address] -u root -p  
#### check the prompt of mysql.   
#### To-Do: I will upgrade this part using helm in order to easy deploment  


[Acquisition API]  
### initialize package.json  
$ npm init  
$ npm install --save mysql express express-myconnection -f  


[Acquisition API]  
$ curl -i localhost:8080/addaccount -H "Content-Type: application/json"  -d '{"id":"kyopark","name":"John"}'  
$ curl -i localhost:8080/adduser -H "Content-Type: application/json"  -d   '{"account_num":1,"id":"kyopark","name":"John","gender":"male","age":25}'  
$ curl -i localhost:8080/adddata -H "Content-Type: application/json"  -d '{"time":1561553417713,"value":0.3}'  


[Debug api - temporary]  
$ curl -i localhost:8080/createdb     // create database  
$ curl -i localhost:8080/createaccounttable  // create account table  
$ curl -i localhost:8080/createusertable  // create user table  
$ curl -i localhost:8080/createdatatable  // create data table  
$ curl -i localhost:8080/checkduplicatednaccount/kyopark   // duplication check  
$ curl -i localhost:8080/getaccounts | python -m json.tool    // show accounts  
$ curl -i localhost:8080/getusers | python -m json.tool  
$ curl -i localhost:8080/getdata  

$ curl localhost:8080/getaccounts | python -m json.tool   
$ curl localhost:8080/getusers  | python -m json.tool  
$ curl localhost:8080/getdata  | python -m json.tool  


[Build]  
$ docker build -t heartbeat:v1 .  

[Heartbeat]  
$ kubectl create -f k8s/heartbeat.yaml  
To-do: I wil change the repository based on gitbub. Now I am still using RDS in Amazon.  



# Troubleshoot
### Error: listen EADDRINUSE: address already in use :::8080
There is a zombie process using 8080. 
So, find the process and then kill it as bellow:
#### $ sudo lsof -i :8080
#### $ kill [PID of the process]
