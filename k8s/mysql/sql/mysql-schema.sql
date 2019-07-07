CREATE DATABASE IF NOT EXISTS my_db;
USE my_db;

CREATE TABLE IF NOT EXISTS my_db.account(
    num int AUTO_INCREMENT, 
    id VARCHAR(20) unique, 
    name VARCHAR(20), 
    PRIMARY KEY(num)
) engine=InnoDB;


CREATE TABLE IF NOT EXISTS my_db.user(
    num int AUTO_INCREMENT, 
    account_num int NOT NULL, 
    name VARCHAR(20), 
    gender VARCHAR(20), 
    age int, 
    PRIMARY KEY(num)
) engine=InnoDB;


CREATE TABLE IF NOT EXISTS my_db.data(
    seq BIGINT AUTO_INCREMENT,
    account_id VARCHAR(20), 
    user_name VARCHAR(20), 
    time BIGINT, 
    value FLOAT(3.3),
    PRIMARY KEY(seq)
) engine=InnoDB;


CREATE TABLE IF NOT EXISTS my_db.jj(
    seq INT AUTO_INCREMENT,
    num INT, 
    PRIMARY KEY(seq)
) engine=InnoDB;

