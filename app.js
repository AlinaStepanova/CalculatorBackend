var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('calculatorapp', ['numbers', 'operations']);
var ObjectId = mongojs.ObjectId;
var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.locals.numberErrors = null;
    res.locals.operationErrors = null;
    res.locals.numbers = null;
    res.locals.operations = null;
    next();
})

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespase = param.split('.')
        , root = namespase.shift()
        , formParam = root;
        while(namespase.length) {
            formParam += '[' + namespase.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

app.get('/', function(req, res) { 
    db.operations.find(function(err, docs) {
        db.numbers.find(function(err, numb) {
            console.log(docs);
            res.render('index', {
                operations : docs,
                numbers : numb
            });
        });
    });
});

app.post('/numbers/add', function(req, res){
    
    req.checkBody('key', 'key is required').notEmpty();
    req.checkBody('value', 'value is required').notEmpty();
    
    var numberErrors = req.validationErrors();
    
    if(numberErrors) {
        res.render('index', {
            numberErrors: numberErrors
        });
    } else {
       var newNumber = {
            key: req.body.key,
            value: req.body.value
        }
       db.numbers.insert(newNumber, function(err, res){
           if(err) {
               console.log(err);
           } 
            req.res.redirect('/');
       });
    }
});

app.post('/operations/add', function(req, res){
    
    req.checkBody('key', 'key is required').notEmpty();
    req.checkBody('value', 'value is required').notEmpty();
    
    var operationErrors = req.validationErrors();
    
    if(operationErrors) {
        res.render('index', {
            operationErrors: operationErrors
        });
    } else {
       var newOperation = {
            key: req.body.key,
            value: req.body.value
        }
       db.operations.insert(newOperation, function(err, res){
           if(err) {
               console.log(err);
           } 
            req.res.redirect('/');
       });
    }
});

app.delete('/numbers/delete/:id', function(req, res){
    db.numbers.remove({_id: ObjectId(req.params.id)}, function(err, result) {
        if (err) {
            console.log(err);
        }
        req.res.redirect('/');
    });
});

app.delete('/operations/delete/:id', function(req, res){
    db.operations.remove({_id: ObjectId(req.params.id)}, function(err, result) {
        if (err) {
            console.log(err);
        }
        req.res.redirect('/');
    });
});

app.listen(3000, function(){
    console.log("server started on port 3000...");
})






