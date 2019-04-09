'use strict';
const nodemailer = require('nodemailer'); 
var formidable = require('formidable');
var express = require('express');
var router = express.Router();
var ensureLoggedIn =  require('connect-ensure-login').ensureLoggedIn
var util = require('util');
var securePin = require('secure-pin');
var fs = require('fs');
var passport = require('passport');
var db = require('../db.js'); 
var bcrypt = require('bcrypt-nodejs');
var securePin = require('secure-pin');
var path = require('path');
var url = require('url'); 
var math = require( 'mathjs' );
var func = require( '../functions/forms.js' );

function rounds( err, results ){ 
	if ( err ) throw err;
}
const saltRounds = bcrypt.genSalt( 10, rounds);


//adminfunction
function admin(x, y, j){
	y.query('SELECT user FROM admin WHERE user = ?', [x], function(err, results, fields){
		if(err) throw err;
		if(results.length === 0){
			j.redirect('/404');
		}
	});
}

//get home 
router.get('/',  function(req, res, next) {
	res.redirect('/page=1');
});

router.get('/category',  function(req, res, next) {
	db.query('SELECT * FROM category', function(err, results, fields){
		if(err) throw err;
		var category = results;
		res.render('category', {title: 'CATEGORIES', category: category});
	});
});


//product 
router.get('/category=:category/product=:product',  function(req, res, next) {
	var products = req.params.product;
	var categorys = req.params.category;
	var prod = products.split('-')
	var cate = categorys.split('-')
	var pro = prod.toString();
	var cat = cate.toString();
	var product = pro.split(',').join(' ');
	var category = cat.split(',').join(' ');
	db.query( 'SELECT * FROM products WHERE product_name = ? and category = ?',  [product, category], function(err, results, fields){
		if( err ) throw err;
		var product = results;
		console.log(product)
		if(results.length === 0){
			res.redirect('/');
		}else{
			res.render('product', {title: 'DISPLAY SITE', products: product, product : results[0].product_name});
		}
	});
});

//get category
router.get('/category=:category/page=:page',  function(req, res, next) {
	var limit  =  12;
	var page = req.params.page;
	var category = req.params.category;
	db.query( 'SELECT COUNT( product_id) AS total FROM products WHERE status  = ? and category = ?',  ['in stock', category], function(err, results, fields){
		if( err ) throw err;
		var totalrows = results[0].total;
		var pages = math.ceil( totalrows / limit ); 
		if( pages === 1 ){
			var offset = 0;
			var sql = 'SELECT * FROM products WHERE status  =  ? and category = ? LIMIT ?, ?';
			var details =  ['in stock', category, offset, limit];
			db.query(sql, details, function ( err, results, fields ){
				if( err ) throw err;
				var products = results;
				//var links = ['/pages/1'];
				res.render( 'category', {title: 'ALL ' + category, product: products, pagination: { page: page, pageCount: pages }});
			});
		}else{
			var offset = ( page * limit ) - limit;
			var sql = 'SELECT * FROM products WHERE status  =  ? and category = ? LIMIT ?, ?';
			var details =  ['in stock', category, offset, limit];
			db.query(sql, details, function ( err, results, fields ){
				if( err ) throw err;
				var products = results;
				res.render( 'category', {title: 'ALL ' + category, product: products, pagination: { page: page, pageCount: pages }});
			});
		}
	});
});

/* GET home page. */
router.get('/page=:page', function ( req, res, next ){
	var limit  =  12;
	var page = req.params.page;
	db.query( 'SELECT COUNT( product_id) AS total FROM products WHERE status  = ?',  ['in stock'], function(err, results, fields){
		if( err ) throw err;
		var totalrows = results[0].total;
		var pages = math.ceil( totalrows / limit ); 
		if( pages === 1 ){
			var offset = 0;
			var sql = 'SELECT * FROM products WHERE status  =  ?  LIMIT ?, ?';
			var details =  ['in stock', offset, limit];
			db.query(sql, details, function ( err, results, fields ){
				if( err ) throw err;
				var products = results;
				//var links = ['/pages/1'];
				res.render( 'index', {title: 'DISPLAY SITE', product: products, pagination: { page: page, pageCount: pages }});
			});
		}else{
			var offset = ( page * limit ) - limit;
			var sql = 'SELECT * FROM products WHERE status  =  ?  LIMIT ?, ?';
			var details =  ['in stock', offset, limit];
			db.query(sql, details, function ( err, results, fields ){
				if( err ) throw err;
				var products = results;
				res.render( 'index', {title: 'DISPLAY SITE', product: products, pagination: { page: page, pageCount: pages }});
			});
		}
	});
});


//ensureLoggedIn( '/login' ),
//get upload
router.get('/admin', ensureLoggedIn('/login'), function(req, res, next) {
	//get the category.
	console.log(req.session)
	var currentUser = req.session.passport.user.user_id;
	admin(currentUser, db, res);
	db.query('SELECT category_name FROM category', function(err, results, fields){
		if(err) throw err;
		var category = results;
		var flashMessages = res.locals.getMessages( );
		
		if( flashMessages.productError ){
			res.render( 'upload', {
				title: 'ADMIN CORNER',
				 category: category,
				showErrors: true,
				errors: flashMessages.productError
			});
		}else{
			if( flashMessages.uploadSuccess ){
				res.render( 'upload', {
					title: 'ADMIN CORNER',
					showSuccess: true,
					category: category,
					success: flashMessages.uploadSuccess
				});
			}else{
				if( flashMessages.parent ){
					res.render( 'upload', {
						title: 'ADMIN CORNER',
						showSuccess: true,
						category: category,
						parent: flashMessages.parent
					});
				}else{
					if( flashMessages.parenterror ){
						res.render( 'upload', {
							title: 'ADMIN CORNER',
							 category: category,
							showErrors: true,
							parenterror: flashMessages.parenterror
						});
					}else{
						if( flashMessages.childsuccess ){
							res.render( 'upload', {
								title: 'ADMIN CORNER',
								showSuccess: true,
								category: category,
								childsuccess: flashMessages.childsuccess
							});
						}else{
							if( flashMessages.childerror ){
								res.render( 'upload', {
									title: 'ADMIN CORNER',
									 category: category,
									showErrors: true,
									childerror: flashMessages.childerror
								});
							}else{
								if( flashMessages.searcherror ){
									res.render( 'upload', {
										title: 'ADMIN CORNER',
										 category: category,
										showErrors: true,
										searcherror: flashMessages.searcherror
									});
								}else{
									if( flashMessages.addsuccess ){
										res.render( 'upload', {
											title: 'ADMIN CORNER',
											showSuccess: true,
											category: category,
											addsuccess: flashMessages.addsuccess
										});
									}else{
										if( flashMessages.adderror ){
											res.render( 'upload', {
												title: 'ADMIN CORNER',
												 category: category,
												showErrors: true,
												adderror: flashMessages.adderror
											});
										}else{
											if( flashMessages.adminerror ){
												res.render( 'upload', {
													title: 'ADMIN CORNER',
													 category: category,
													showErrors: true,
													adminerror: flashMessages.adminerror
												});
											}else{
												if( flashMessages.adminsuccess ){
													res.render( 'upload', {
														title: 'ADMIN CORNER',
														showSuccess: true,
														category: category,
														adminsuccess: flashMessages.adminsuccess
													});
												}else{
													if( flashMessages.producterror ){
														res.render( 'upload', {
															title: 'ADMIN CORNER',
															 category: category,
															showErrors: true,
															producterror: flashMessages.producterror
														});
													}else{
														if( flashMessages.statussuccess ){
															res.render( 'upload', {
																title: 'ADMIN CORNER',
																showSuccess: true,
																category: category,
																statussuccess: flashMessages.statussuccess
															});
														}else{
															res.render('upload', {title: 'ADMIN CORNER', category: category});
														}
													}
												}
											}
											
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
});


//get login
router.get('/login', function(req, res, next) {  
	const flashMessages = res.locals.getMessages( );
	if( flashMessages.error ){
		res.render( 'login', {
			title: 'LOGIN',
			showErrors: true,
			errors: flashMessages.error
		});
	}else{
		res.render('login', { title: 'LOG IN'});
	}
});


//register get request
router.get('/register', function(req, res, next) {	
    res.render('register',  { title: 'REGISTRATION'});
});

//get logout
router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

//Passport login
passport.serializeUser(function(user_id, done){
  done(null, user_id)
});
        
passport.deserializeUser(function(user_id, done){
  done(null, user_id)
});

//post add status.
router.post('/status', function(req, res, next) {
	var status = req.body.status;
	var id = req.body.id;
	db.query( 'SELECT product_name FROM products WHERE product_id = ?', [id], function ( err, results, fields ){
		if(err) throw err;
		if (results.length === 0){
			var error = 'This product id does not exist';
			req.flash('producterror', error);
			res.redirect('/admin/#productStatus');
		}else{
			var product = results[0].product_name;
			db.query( 'UPDATE products SET status  = ? WHERE id = ?', [status, id], function ( err, results, fields ){
				if(err) throw err;
				var success = product + ' has been updated to ' + status + ' successfully';
				req.flash('statussuccess', success);
				res.redirect('/admin/#productStatus');
			});
		}
	});
});

//post search.
router.post('/searchproduct', function(req, res, next) {
	var product_id = req.body.product_id;
	
	db.query( 'SELECT * FROM products WHERE product_id = ?', [product_id], function ( err, results, fields ){
		if(err) throw err;
		if(results.length === 0){
			var error = 'This product id does not exist';
			req.flash('searcherror', error);
			res.redirect('/admin/#searchresults');
		}else{
			var product = results;
			res.render('upload', {title: 'ADMIN CORNER', searchresults: product});
		}
	});
});


//post add new category never existed.
router.post('/newcat', function(req, res, next) {
	var category = req.body.category;
	db.query( 'SELECT category_name FROM category WHERE category_name  = ?', [category], function ( err, results, fields ){
	console.log( results )
		if ( results.length > 0 ){
			var error = 'This category exists already';
			req.flash('parenterror', error);
			
			res.redirect('/admin');
		}else{
			db.query('CALL newcat (?)', [category], function(err, results, fields){
				if (err) throw err;
				var parent = 'Category added.';
				var success = ' New category added successfully';
				req.flash('parent', success);
			
				res.redirect('/admin');
				
			});
		}
	});
});

//post log in
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successReturnToOrRedirect: '/admin',
  failureFlash: true
}));

//add new admin
router.post('/addadmin', function (req, res, next) {
	var user = req.body.user;
	db.query('SELECT user_id, username FROM user WHERE user_id = ?', [user], function(err, results, fields){
		if( err ) throw err;
		if ( results.length === 0){
			var error = 'Sorry this user does not exist.';
			req.flash('adderror', error);
			res.redirect('/admin/#addadmin');
		}
		else{
			db.query('SELECT user FROM admin WHERE user = ?', [user], function(err, results, fields){
				if( err ) throw err;
				if( results.length === 0 ){
					db.query('INSERT INTO admin ( user ) values( ? )', [user], function(err, results, fields){
						if( err ) throw err;
						var success = 'New Admin Added Successfully!';
						req.flash('addsuccess', success);
						res.redirect('/admin/#addadmin');
					});
				}
				if( results.length > 0 ){
					var error = 'This user is already an Admin';
					req.flash('adderror', error);
					res.redirect('/admin/#addadmin');
				} 
			});
		}
	});
});


//delete admin
router.post('/deladmin', function (req, res, next) {
	var user = req.body.user;
	db.query('SELECT user_id, username FROM user WHERE user_id = ?', [user], function(err, results, fields){
		if( err ) throw err;
		if ( results.length === 0){
			var error = 'Sorry this user does not exist.';
			req.flash('adminerror', error);
			res.redirect('/admin/#deladmin');
		}
		else{
			db.query('SELECT user FROM admin WHERE user = ?', [user], function(err, results, fields){
				if( err ) throw err;
				if( results.length === 0 ){
					var error = 'Sorry this admin does not exist.';
					req.flash('adminerror', error);
					res.redirect('/admin/#deladmin');
				}
				else {
					db.query('DELETE FROM admin WHERE user = ?', [user], function(err, results, fields){
						if( err ) throw err;
						var success = 'Admin deleted successfully!'
						req.flash('adminsuccess', success);
						res.redirect('/admin/#deladmin');
					});
				}
			});
		}
	});
});

//post add category 
router.post('/addcategory',  function(req, res, next) {
	var category = req.body.category;
	var parent = req.body.parent;
	console.log( req.body );
	db.query( 'SELECT category_name FROM category WHERE category_name  = ?', [category], function ( err, results, fields ){
	console.log( results )
		if ( results.length > 0 ){
			var error = 'This category exists already';
			req.flash('childerror', error);
			res.redirect('/admin');
		}else{
			db.query('CALL addnewcategory (?, ?)', [parent, category], function(err, results, fields){
				if (err) throw err;
				var success = 'Category added.';
				req.flash('childsuccess', success);
				res.redirect('/admin')
			
			});		
		}
	});
});


router.post('/upload', function(req, res, next) {
	//var category = req.body.category;
	if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
		// parse a file upload
		var form = new formidable.IncomingForm();
		var did = '/Users/STAIN/desktop/sites/display-site';
		var dir = did + '/template/public/images/samples/';
		console.log(dir)
		form.uploadDir = dir;
		form.maxFileSize = 2 * 1024 * 1024;
		form.parse(req, function(err, fields, files) {
			//var img = fields.img; 
			var category = fields.category;
			var price = fields.price;
			var description = fields.description;
			var product = fields.product;
			
			var prod = product.split(' ');
			var pro = prod.toString();
			var products = pro.split(',').join('-');
		
			
			var cate = category.split(' ');
			var cat = cate.toString();
			var categorys = cat.split(',').join('-');
			
			var url = '/category=' + categorys  + '/product=' + products;
			console.log(fields);
			var getfiles = JSON.stringify( files );
			var file = JSON.parse( getfiles );
			var oldpath = file.img.path;
			//console.log(oldpath, typeof oldpath, typeof file, file.path, typeof file.path);
			var name = file.img.name;
			form.keepExtensions = true;
			var newpath = dir + name;
			var img = '/images/samples/' + name;
			form.on('fileBegin', function( name, file){
				db.query( 'SELECT product_name FROM products WHERE product_name  = ?', [product], function ( err, results, fields ){
					if (err) throw err;
					if(results.length > 0){
						fs.unlink(newpath, function(err){
							if (err) throw err;
							var error = 'Ooops! It seems ' + product + ' has been added already';
							req.flash('productError', error);
							res.redirect('/admin/#productError')
						});
					}else{
						//rename the file
						fs.rename(oldpath, newpath, function(err){
							if (err) throw err;
							//console.log('file renamed');
						});
						//secure pin for code
						securePin.generatePin(10, function(pin){
						//save in the database.
							db.query('INSERT INTO products (image, url,  category, price, product_id, description, product_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [img, url, category, price, pin, description, product, 'in stock'], function(err,results, fields){
								if (err)  throw err;
								var success =  product + ' was been added successfully!';
								req.flash('uploadSuccess', success);
								res.redirect('/admin/#productsuccess')
							});
						});
					}
				});
			});
			form.emit('fileBegin', name, file);
	    });
	}
});


//Passport login
passport.serializeUser(function(user_id, done){
  done(null, user_id)
});
        
passport.deserializeUser(function(user_id, done){
  done(null, user_id)
});


//post the register
//var normal = require( '../functions/normal.js' );
router.post('/register', function (req, res, next) {
	req.checkBody('username', 'Username must be between 8 to 25 characters').len(8,25);
	req.checkBody('fullname', 'Full Name must be between 8 to 25 characters').len(8,25);
	req.checkBody('pass1', 'Password must be between 8 to 25 characters').len(8,100);
	req.checkBody('pass2', 'Password confirmation must be between 8 to 100 characters').len(8,100);
	req.checkBody('email', 'Email must be between 8 to 105 characters').len(8,105);
	req.checkBody('email', 'Invalid Email').isEmail();
	req.checkBody('code', 'Country Code must not be empty.').notEmpty();
	req.checkBody('pass1', 'Password must match').equals(req.body.pass2);
	req.checkBody('phone', 'Phone Number must be ten characters').len(10);
  
	var username = req.body.username;
	var password = req.body.pass1;
	var cpass = req.body.pass2;
	var email = req.body.email;
	var fullname = req.body.fullname;
	var code = req.body.code;
	var phone = req.body.phone;

	var errors = req.validationErrors();
	if (errors) { 
	
		console.log(JSON.stringify(errors));
  
		res.render('register', { title: 'REGISTRATION FAILED', errors: errors, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, code: code, sponsor: sponsor});
	}else{
		db.query('SELECT username FROM user WHERE username = ?', [username], function(err, results, fields){
          	if (err) throw err;
			
          	if(results.length===1){
          		var error = "Sorry, this username is taken";
				console.log(error);
				res.render('register', {title: "REGISTRATION FAILED", error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, code: code,  sponsor: sponsor});
          	}else{
				//check the email
				db.query('SELECT email FROM user WHERE email = ?', [email], function(err, results, fields){
          			if (err) throw err;
          			if(results.length===1){
          				var error = "Sorry, this email is taken";
            			console.log(error);
						res.render('register', {title: "REGISTRATION FAILED", error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname, code: code,  sponsor: sponsor});
            		}else{
						bcrypt.hash(password, saltRounds, null, function(err, hash){
							db.query( 'INSERT INTO user (full_name, phone, username, email, code, password) VALUES(?,  ?, ?, ?, ?, ?)', [ fullname, phone, username, email, code, hash], function(err, result, fields){
								if (err) throw err;
								var success = 'Successful registration';
								res.render('register', {title: 'REGISTRATION SUCCESSFUL!', success: success});
							});
						});
					}
				});
			}
		});
	}
});

router.get('/404', function(req, res, next) {
  res.render('404', {title: 'PAGE NOT FOUND', message: 'Ooops  since you got lost somehow but i am here to catch you. see our quick links.'});
});
router.get( '*', function ( req, res, next ){
	res.redirect( '/404' )
});
module.exports = router;