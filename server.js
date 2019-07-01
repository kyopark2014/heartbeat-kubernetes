const express = require('express')
const app = express();

const bodyParser = require('body-parser')
app.use(bodyParser.json())

// Create connection
var mysql = require('mysql')

var DB_HOST = process.env.DB_HOST;
var DB_USER = process.env.DB_USER;
var DB_PASS = process.env.DB_PASS;
var DB_NAME = process.env.DB_NAME;

var myConnection  = require('express-myconnection')
var dbOptions = {
    host : DB_HOST,
    user : DB_USER,
    password : DB_PASS,
    database : DB_NAME
}

// single - creates single database connection for an application instance. Connection is never closed. In case of disconnection it will try to reconnect again as described in node-mysql docs.
// pool - creates pool of connections on an app instance level, and serves a single connection from pool per request. The connections is auto released to the pool at the response end.
// request - creates new connection per each request, and automatically closes it at the response end.
app.use(myConnection(mysql, dbOptions, 'pool'))

// Create DB - account
app.get('/createdb', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error;
        }
         
        let sql = 'CREATE DATABASE IF NOT EXISTS my_db';
        conn.query(sql, (err, result) => {
            if(err) {
                res.status(500).send(err.message)
                throw err
            }
            
            console.log(result)
            res.send('Database was created...')
       }) 
    })
})

// Create table - account
app.get('/createaccounttable', (req, response) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }
        let sql = 'CREATE TABLE IF NOT EXISTS my_db.account(num int AUTO_INCREMENT, id VARCHAR(20) unique, name VARCHAR(20), PRIMARY KEY(num))'
        conn.query(sql, (err, result) => {
            if(err) {
                response.status(500).send(err.message)
                throw err
            }

            console.log(result)
            response.send('account table created...')
        })
    })
})

// Create table - user
app.get('/createusertable', (req, response) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }

        let sql = 'CREATE TABLE IF NOT EXISTS my_db.user(num int AUTO_INCREMENT, account_num int, name VARCHAR(20), gender VARCHAR(20), age int, PRIMARY KEY(num))'
        conn.query(sql, (err, result) => {
            if(err) {
                response.status(500).send(err.message)
                throw err
            }
            console.log(result);
            response.send('User table created...')
        })
    })
})

// Create table - data
app.get('/createdatatable', (req, response) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }    
        let sql = 'CREATE TABLE IF NOT EXISTS my_db.data(num BIGINT AUTO_INCREMENT, time BIGINT, value FLOAT(2.2),PRIMARY KEY(num))'
        conn.query(sql, (err, result) => {
            if(err) {
                response.status(500).send(err.message)
                throw err
            }
            console.log(result)
            response.send('Data table created...')
        })
    })
})

// check the duplication of the account
app.get('/checkduplicatednaccount/:id', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   
        let sql = 'SELECT * FROM my_db.account WHERE id = "'+req.params.id+'"'
        
        conn.query(sql, (err,result)  => {
            if(err) throw err
            console.log(result)

            if(result == "") res.status(404).json( {errorMessage: "User was not found"})
            else res.status(200).send(result)
        })
    })
})

// Insert account
app.post('/addaccount', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   

        let sql = 'INSERT INTO my_db.account (id,name) SELECT \''+ req.body.id+'\',\'' +req.body.name+'\' WHERE NOT EXISTS (SELECT id FROM my_db.account WHERE id = \''+req.body.id+'\')'
        // INSERT INTO my_db.account (id, name) SELECT 'kyopark','john' FROM dual WHERE NOT EXISTS (SELECT id FROM my_db.account WHERE id = 'kyopark')
        console.log(sql);
        conn.query(sql, (err,result) => {
            if(err) throw err

            console.log(result)
            res.send('account was added...')
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

        let post = {account_num: req.body.account_num, name: req.body.name, gender: req.body.gender, age: req.body.age}
        console.log(post)
        let sql = 'INSERT INTO my_db.user SET ?'
        conn.query(sql, post, (err,result) => {
            if(err) throw err

            console.log(result)
            res.send('User was added...')
        })
    })
})

// Insert Data
app.post('/adddata', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   

        let post = {time: req.body.time, value: req.body.value}
        console.log(post);
        let sql = 'INSERT INTO my_db.data SET ?'
        conn.query(sql, post, (err,result) => {
            if(err) throw err

            console.log(result)
            res.send('New Data was added...')
        })
    })
})

function sleep(millis) {
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
})

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
            res.status(200).send(result)
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

        let sql = 'SELECT * FROM my_db.user'
        conn.query(sql, (err,result) => {
            if(err) throw err
            console.log(result)
            res.status(200).send(result)
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

        let sql = 'SELECT * FROM my_db.data'
        conn.query(sql, (err,result) => {
            if(err) throw err
            console.log(result)
            res.status(200).send(result)
        })
    })
})


// show one of data
app.get('/getdata/:num', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }     

        let sql = 'SELECT * FROM my_db.data WHERE num = '+req.params.num;
        console.log(sql);
        
        conn.query(sql, (err,result)  => {
            if(err) throw err
            console.log(result)

            if(result == "") res.status(404).json( {errorMessage: "User was not found"})
            else res.status(200).send(result)
        })
    })
})

app.listen('8080',() => {
    console.log('Server started on port 8080')
})
