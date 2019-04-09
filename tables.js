var db = require('./db.js');

db.query('CREATE TABLE IF NOT EXISTS products (id INT(11) NOT NULL, product_name VARCHAR(255) NOT NULL, product_id BIGINT(10) NOT NULL, category VARCHAR(255) NOT NULL, date_entered DATETIME DEFAULT CURRENT_TIMESTAMP, image VARCHAR (255) NOT NULL, url VARCHAR(255) NOT NULL, description TEXT NOT NULL, new_price INT(11) NULL, discount INT(11) NULL, status VARCHAR (255) NOT NULL, price INT(11) NOT NULL)', function(err, results){
	if (err) throw err;
	console.log('product table created');
});
/*
DELIMITER //
CREATE PROCEDURE addnewcategory( parent VARCHAR(255), category VARCHAR(255))
BEGIN

SELECT @myLeft := lft FROM category WHERE category_name = parent;

UPDATE category SET rgt = rgt + 2 WHERE rgt > @myLeft;
UPDATE category SET lft = lft + 2 WHERE lft > @myLeft;
INSERT INTO category(category_name, lft, rgt) VALUES(category, @myLeft + 1, @myLeft + 2);

END //
DELIMITER ;
*/