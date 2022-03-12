var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// connect to the database
var db = mongoose.connect('mongodb://localhost/swag-shop');

var Product = require('./model/product');
var Wishlist = require('./model/wishlist');

// start express server
var app = express();

// use body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// fetch products
app.get('/product', function(req, res) {
  Product.find({}, function(err, products) {
    if (err) {
      res.status(500).send({error: 'Could not fetch products'});
    } else {
      res.send(products);
    }
  });
});

// create new product
app.post('/product', function(req, res) {
  var product = new Product();

  product.title = req.body.title;
  product.price = req.body.price;

  product.save(function(err, newProduct) {
    if (err) {
      res.status(500).send({error: 'Could not save product'});
    } else {
      res.send(newProduct);
    }
  })
});

// fetch wishlists
app.get('/wishlist', function(req, res) {
  Wishlist.find({}).populate({path: 'products', model: 'Product'}).exec(function(err, wishlists) {
    if (err) {
      res.status(500).send({error: 'Could not fetch wishlists'});
    } else {
      res.send(wishlists);
    }
  });
});

// create new wishlist
app.post('/wishlist', function(req, res) {
  var wishlist = new Wishlist();

  wishlist.title = req.body.title;

  wishlist.save(function(err, newWishlist) {
    if (err) {
      res.status(500).send({error: 'Could not save wishlist'});
    } else {
      res.send(newWishlist);
    }
  })
});

// add product to wishlist
app.put('/wishlist/product/add', function(req, res) {
  var productId = req.body.productId;
  var wishlistId = req.body.wishlistId;

  Product.findOne({_id: productId}, function(err, product) {
    if (err) {
      res.status(500).send({error: 'Could not find a product'});
    } else {
      Wishlist.update({_id: wishlistId},
        {$addToSet: {products: product._id}},
        function(err, res) {
          if (err) {
            res.status(500).send({error: 'Could not add product to wishlist'});
          } else {
            res.send('Product added to wishlist');
          }
      });
    }
  });
});

app.listen(3000, function() {
  console.log('Swag shop API running on port 3000!');
})
