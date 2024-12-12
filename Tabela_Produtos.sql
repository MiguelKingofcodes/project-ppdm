create database ppdm_activity;
use ppdm_activity;

CREATE TABLE products (
    id_product INTEGER PRIMARY KEY AUTO_INCREMENT,
    name_product TEXT NOT NULL,
    price_product REAL NOT NULL
);