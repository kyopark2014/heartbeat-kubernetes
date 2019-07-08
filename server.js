const express = require('express')
const app = express();

const bodyParser = require('body-parser')
app.use(bodyParser.json())

// Create connection
var mysql = require('mysql')

var myConnection  = require('express-myconnection')

var config = require('./config')
var dbOptions = {
	host:	  config.database.host,
	user: 	  config.database.user,
	password: config.database.password,
//	port: 	  config.database.port, 
	database: config.database.db
}

// single - creates single database connection for an application instance. Connection is never closed. In case of disconnection it will try to reconnect again as described in node-mysql docs.
// pool - creates pool of connections on an app instance level, and serves a single connection from pool per request. The connections is auto released to the pool at the response end.
// request - creates new connection per each request, and automatically closes it at the response end.
app.use(myConnection(mysql, dbOptions, 'pool'))

// Insert account
app.post('/addaccount', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   

        let sql = 'INSERT INTO my_db.account (id,name) SELECT \''+ req.body.id+'\',\'' +req.body.name+'\' WHERE NOT EXISTS (SELECT id FROM my_db.account WHERE id = \''+req.body.id+'\')'

        console.log(sql);
        conn.query(sql, (err,result) => {
            if(err) throw err

            console.log(result)
            if(result.insertId == 0) 
                // res.status(400).json({  
                res.status(200).json({  // Based on Client request, resultCode represents the state of response. i.e) 0: normal, others: error 
                    resultCode: 2,
                    resultMessage:"Failure: Not inserted, may duplicated",
                    id: req.body.id,
                    name: req.body.name}) 
            else 
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                    id: req.body.id,
                    name: req.body.name}) 
        })
    })
})

// check the duplication of the account
app.get('/checkduplicatedaccount/:id', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   
        let sql = 'SELECT * FROM my_db.account WHERE id = "'+req.params.id+'"'
        
        conn.query(sql, (err,result)  => {
            if(err) throw err
            console.log(result)

            if(result == "") 
                // res.status(404).json({
                res.status(200).json({  // Based on Client request, resultCode represents the state of response. i.e) 0: normal, others: error
                    resultCode: 2,
                    resultMessage:"Failure: No account in the server",
                    account: req.params.id
                }) 
            else 
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success: the account exists in the server",
                    account: req.params.id
                })               
        })
    })
})

// Insert User
app.post('/adduser', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   

        let sql = 'INSERT INTO my_db.user (name,gender,age,account_num) SELECT \''+req.body.name+'\',\''+req.body.gender+'\','+req.body.age+', (SELECT num from my_db.account WHERE id = \''+req.headers.account+'\')'+' WHERE NOT EXISTS (SELECT name FROM my_db.user WHERE name = \''+req.body.name+'\')'
        console.log(sql);

        conn.query(sql, (err,result) => {
            if(err) throw err

            console.log(result)
            if(result.insertId == 0) 
                // res.status(400).json({
                res.status(200).json({  // Based on Client request, resultCode represents the state of response. i.e) 0: normal, others: error
                    resultCode: 2,
                    resultMessage:"Failure: Not inserted, may duplicated",
                    name: req.body.name,
                    gender: req.body.gender,
                    age: req.body.age
                }) 
            else 
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                    name: req.body.name,
                    gender: req.body.gender,
                    age: req.body.age
                }) 
        }) 
    })
})

// Insert Data - single 
app.post('/adddata', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   
        console.log(req.body);
        //let sql = 'INSERT INTO my_db.data (account_id, user_name, time, value) SELECT \''+ req.headers.account+'\',\''+ req.headers.user +'\',\''+req.body.time+'\',\''+req.body.value+'\' WHERE EXISTS (SELECT id from my_db.account WHERE id =\'' + req.headers.account + '\') WHERE EXISTS (SELECT name from my_db.user WHERE name =\'' + req.headers.user + '\')'  
        let sql = 'INSERT INTO my_db.data (account_id, user_name, time, value) SELECT \''+ req.headers.account+'\',\''+ req.headers.user +'\',\''+req.body.time+'\',\''+req.body.value+'\' WHERE EXISTS (SELECT id from my_db.account WHERE id =\'' + req.headers.account + '\')'  
        
        
        console.log(sql); 

        //conn.query(sql, post, (err,result) => {
        conn.query(sql, (err,result) => {    
            if(err) throw err

            console.log(result)

            if(result.insertId == 0) 
                // res.status(400).json({
                res.status(200).json({  // Based on Client request, resultCode represents the state of response. i.e) 0: normal, others: error
                    resultCode: 2,
                    resultMessage:"Failure: Not inserted, Not match Account",
                    name: req.body.name,
                    gender: req.body.gender,
                    age: req.body.age
                }) 
            else
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                    result: req.body
                })              
            })        
    })
})
// Insert Data - multiple
app.post('/adddata_bulk/', (req, res) => {     
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   
      
        console.log(req.body);
        var body = JSON.stringify(req.body);

        let sql = 'INSERT INTO my_db.data (account_id, user_name, time, value) SELECT \''+req.headers.account+'\',\''+req.headers.user+'\',JSON_EXTRACT(\''+body+'\',CONCAT(\'$[\', num, \'].time\')),JSON_EXTRACT(\''+body+'\',CONCAT(\'$[\', num, \'].value\')) FROM (SELECT \''+body+'\' AS B) AS A JOIN jj ON num < JSON_LENGTH(\''+body+'\');'      
        // let sql = 'INSERT INTO my_db.data (time, value) SELECT JSON_EXTRACT(\''+body+'\',CONCAT(\'$[\', num, \'].time\')),JSON_EXTRACT(\''+body+'\',CONCAT(\'$[\', num, \'].value\')) FROM (SELECT \''+body+'\' AS B) AS A JOIN jj ON num < JSON_LENGTH(\''+body+'\');'      
        console.log(sql);

        conn.query(sql, (err,result) => {
            if(err) throw err

            if(result.insertId == 0) 
                // res.status(400).json({
                res.status(200).json({  // Based on Client request, resultCode represents the state of response. i.e) 0: normal, others: error
                    resultCode: 2,
                    resultMessage:"Failure: Not inserted, Not match Account",
                    name: req.body.name,
                    gender: req.body.gender,
                    age: req.body.age
                }) 
            else
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                    result: req.body
                })              

            console.log('# of inserted: '+result.affectedRows)
        })  
    }) 
})

/*function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
// Insert Data - for testing

var datetime = require('node-datetime');
app.post('/adddatafortest', (req, res) => {
    const userdata = [];

    for (var i=0; i<5; i++) {
        var current = datetime.create();
        userdata.push({time: current.getTime(), value: 0.3});

        sleep(100);
    }

    console.log(userdata);

    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }  
        let sql = 'INSERT INTO my_db.data SET ?'
        conn.query(sql, userdata, (err,result) => {
            if(err) throw err

            console.log(result)
            res.send('New Data was added...')
        })
    })
}) */

// show admin accounts
app.get('/getaccounts', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }  

        let sql = 'SELECT * FROM my_db.account'
        conn.query(sql, (err,result) => {
            if(err) throw err

            console.log(result)
            res.status(200).json({
                resultCode: 0,
                resultMessage:"Success",
                result
            })              
        })
    })
})

// show user accounts
app.get('/getusers', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }  

        let sql = 'SELECT * FROM my_db.user WHERE account_num = (SELECT num FROM my_db.account WHERE id = \''+req.headers.account+'\')'
        console.log(sql);

        conn.query(sql, (err,result) => {
            if(err) throw err

            console.log(result)
            if(result.insertId == 0) 
                // res.status(404).json({
                res.status(200).json({  // Based on Client request, resultCode represents the state of response. i.e) 0: normal, others: error
                    resultCode: 2,
                    resultMessage:"Failure: No user in the account",
                    name: req.body.name,
                    gender: req.body.gender,
                    age: req.body.age
                }) 
            else 
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                    result
                })         
        })
    })
})

// show all datas
app.get('/getdata', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }  

        let sql = 'SELECT * FROM my_db.data WHERE user_name = \''+req.headers.user+'\' AND account_id = \''+req.headers.account+'\''
        
        console.log(sql)
        conn.query(sql, (err,result) => {
            if(err) throw err
            
            console.log(result)
            if(result == "") 
                // res.status(404).json({
                res.status(200).json({  // Based on Client request, resultCode represents the state of response. i.e) 0: normal, others: error
                    resultCode: 1,
                    resultMessage:"Failure: no data for the account and user",
                    result
                }) 
            else 
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                    result
                })              
        })
    })
})

app.listen('8080',() => {
    console.log('Server started on port 8080')
})
