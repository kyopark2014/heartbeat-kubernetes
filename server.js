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
            if(result.insertId == 0) 
                res.status(500).json({
                    resultCode: 2,
                    resultMessage:"Failure: Not created, may already exists"
                }) 
            else 
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                })   
       }) 
    })
})

// Create table - account
app.get('/createaccounttable', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }
        let sql = 'CREATE TABLE IF NOT EXISTS my_db.account(num int AUTO_INCREMENT, id VARCHAR(20) unique, name VARCHAR(20), PRIMARY KEY(num))'
        conn.query(sql, (err, result) => {
            if(err) {
                res.status(500).send(err.message)
                throw err
            }

            console.log(result)
            if(result.insertId == 0) 
                res.status(500).json({
                    resultCode: 2,
                    resultMessage:"Failure: Not created, may already exists"
                }) 
            else 
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                })   
        })
    })
})

// Create table - user
app.get('/createusertable', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }

        let sql = 'CREATE TABLE IF NOT EXISTS my_db.user(num int AUTO_INCREMENT, account_num int NOT NULL, name VARCHAR(20), gender VARCHAR(20), age int, PRIMARY KEY(num))'
        conn.query(sql, (err, result) => {
            if(err) {
                res.status(500).send(err.message)
                throw err
            }
            console.log(result);

            if(result.insertId == 0) 
                res.status(500).json({
                    resultCode: 2,
                    resultMessage:"Failure: Not created, may already exists"
                }) 
            else 
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                })   
        })
    })
})

// Create table - data
app.get('/createdatatable', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }    
        let sql = 'CREATE TABLE IF NOT EXISTS my_db.data(seq BIGINT AUTO_INCREMENT,account_id VARCHAR(20), user_name VARCHAR(20), time BIGINT, value FLOAT(3.3),PRIMARY KEY(seq))'
        conn.query(sql, (err, result) => {
            if(err) {
                res.status(500).send(err.message)
                throw err
            }
            console.log(result)

            if(result.insertId == 0) 
                res.status(500).json({
                    resultCode: 2,
                    resultMessage:"Failure: Not created, may already exists"
                }) 
            else 
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                })   
        })
    })
})

// Create JJ table - which is required for Json to MySQL
// To-do: JJ API will be removed
app.get('/createJJtable', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }    
        let sql = 'CREATE TABLE IF NOT EXISTS my_db.jj(seq INT AUTO_INCREMENT,num INT, PRIMARY KEY(seq))'
        //let sql = 'CREATE TABLE IF NOT EXISTS my_db.jj(num int(10) unsigned NOT NULL)'   //num int(10) unsigned NOT NULL, PRIMARY KEY (num)
        conn.query(sql, (err, result) => {
            if(err) {
                res.status(500).send(err.message)
                throw err
            }
            
            console.log(result)
            if(result.insertId == 0) 
                res.status(500).json({
                    resultCode: 2,
                    resultMessage:"Failure: Not created, may already exists"
                }) 
            else 
                res.status(200).json({
                    resultCode: 0,
                    resultMessage:"Success",
                })             
        })
    })
})

// Initialize JJ
app.get('/initializejj', (req, res) => {
    req.getConnection( (error, conn) => {
        if(error) {
            console.log('Connection Failure...')
            throw error
        }   

        let sql = 'INSERT INTO my_db.jj (num) VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28),(29),(30),(31),(32),(33),(34),(35),(36),(37),(38),(39),(40),(41),(42),(43),(44),(45),(46),(47),(48),(49),(50),(51),(52),(53),(54),(55),(56),(57),(58),(59),(60),(61),(62),(63),(64),(65),(66),(67),(68),(69),(70),(71),(72),(73),(74),(75),(76),(77),(78),(79),(80),(81),(82),(83),(84),(85),(86),(87),(88),(89),(90),(91),(92),(93),(94),(95),(96),(97),(98),(99);'

        console.log(sql);
        conn.query(sql, (err,result) => {
            if(err) throw err

            console.log(result)
            
            // res.send('Table JJ is intialized')
            res.status(200).json({
                resultCode: 0,
                resultMessage:"Success",
            })             
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

            //if(result == "") res.status(404).json( {errorMessage: "User was not found"})
            //else res.status(200).send("The account is already registered.")
            if(result == "") 
                res.status(404).json({
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
                res.status(400).json({
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
                res.status(400).json({
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

        let post = {account_id: req.headers.account, user_name: req.headers.user, time: req.body.time, value: req.body.value}
        console.log(post);
        let sql = 'INSERT INTO my_db.data SET ?'
        conn.query(sql, post, (err,result) => {
            if(err) throw err

            console.log(result)

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

            res.status(200).json({
                resultCode: 0,
                resultMessage:"Success",
                result: req.body
                //,addedCount: result.affectedRows
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
                res.status(404).json({
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
                res.status(404).json({
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
