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
$ kubectl create -f k8s/mysql/mysql-service.yaml  
#### [Reference](https://github.com/hongjsk/spring-petclinic-kubernetes/tree/master/k8s/mysql)  
#### Setup the database in .bashrc  
export DB_HOST='abcedfefewfdfdfdf-158449500.eu-west-2.elb.amazonaws.com';  
export DB_USER='root';  
export DB_PASS='passwd';  
export DB_NAME='database';  


### Create mysql-credential Secret  
$ kubectl create secret generic mysql-credential --from-file=./username --from-file=./password  
### Set configmap  
$ kubectl create -f k8s/mysql-configmap.yaml  
### Get the public ip address or domain  
$ kubectl get service -o wide  
### Check the connectivity of mysql using the earn address of the mysql server  
$ mysql -h ip-address -P port -u root -p
### Initialize DB table and values
$ mysql -h $DB_HOME -u root -p < k8s/mysql/sql/mysql-schema.sql
$ mysql -h $DB_HOME -u root -p < k8s/mysql/sql/mysql-data.sql
### Make config.js  
```c
var config = {
	database: {
		host:	  'localhost', 	// database host
		user: 	  'root', 		// your database username
		password: 'password', 		// your database password
		port: 	  3306, 		// default MySQL port
		db: 	  'my_db' 		// your database name
	},
	server: {
		host: 'localhost',
		port: '8080'
	}
}
module.exports = config
```


#### Check the prompt of mysql.   
#### To-Do: I will upgrade this part using helm in order to easy deploment  

### Initialize package.json  
$ npm init  
$ npm install --save mysql express express-myconnection -f  

## API in Swagger Hub  
/addaccount  
/adduser  
/adddata  
/adddata_bulk  
/checkduplicatedaccount  
/getusers  
/getdata  
[Heartbeat](https://app.swaggerhub.com/apis-docs/kyopark2014/heartbeat/1.0.0)

[Build]  
$ docker build -t heartbeat:v1 .  

[Heartbeat]  
$ kubectl create -f k8s/heartbeat.yaml  
$ kubectl create -f k8s/heartbeat-service.yaml  
To-do: I wil change the repository from AWS to the repository of gitbub.  

[Monitoring]   
#### Install prometheus  
$ cd charts/prometheus  
$ helm install -f values.yaml stable/prometheus --name prometheus --namespace prometheus  

#### Expose prometheus  
$ export POD_NAME=$(kubectl get pods --namespace prometheus -l "app=prometheus,component=server" -o jsonpath="{.items[0].metadata.name}")  
$ kubectl --namespace prometheus port-forward $POD_NAME 9090  
browser: http://localhost:9090

#### Install grafana  
$ cd charts/grafana  
$ helm install -f values.yaml stable/grafana --name grafana --namespace grafana  

#### Check password  
$ kubectl get secret --namespace grafana grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo  

#### Expose grafana  
$ export POD_NAME=$(kubectl get pods --namespace grafana -l "app=grafana,release=grafana" -o jsonpath="{.items[0].metadata.name}")  
$ kubectl --namespace grafana port-forward $POD_NAME 3000  

#### Auto scaling
$ helm install -f charts/metrics-server/values.yaml stable/metrics-server --name metrics-server  
$ kubectl create -f k8s/autoscaling.yaml  

#### Nginx-Ingress
$ helm install -f values.yaml stable/nginx-ingress --name nginx-ingress --namespace nginx-ingress --set controller.metrics.enabled=true
- upgread
$ helm upgrade --reuse-values -f values.yaml nginx-ingress stable/nginx-ingress
$ kubectl create -f ingress.yaml

# Troubleshoot
### Error: listen EADDRINUSE: address already in use :::8080
There is a zombie process using 8080. 
So, find the process and then kill it as bellow:
#### $ sudo lsof -i :8080
#### $ kill [PID of the process]

