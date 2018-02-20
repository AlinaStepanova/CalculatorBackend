var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var app = express();
var firebase = require('firebase');

firebase.initializeApp({
    serviceAccount: "Calculator-b5a54fcfddf1.json",
    databaseURL:'https://calculator-5349b.firebaseio.com/'
});

var ref = firebase.database().ref();
var numbersRef = ref.child('numbers');
var operationsRef = ref.child('operations');

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

app.get('/', function(req, res, next) { 
    var getNumbers = firebase.database().ref('/numbers').once('value', function(snapshot) {
        var number = [];
        snapshot.forEach(function(childSnapshot) {
            number.id = childSnapshot.key;
            number.key = childSnapshot.val().key;
            number.value = childSnapshot.val().value;
            console.log(number.id);
        });
        return number;
    });
    
    var getOperations = firebase.database().ref('/operations').once('value', function(snapshot) {
        var operation = [];
        snapshot.forEach(function(childSnapshot) {
            operation.id = childSnapshot.key;
            operation.key = childSnapshot.val().key;
            operation.value = childSnapshot.val().value;
        });
        return operation;
    });
        Promise.all([getNumbers, getOperations]).then(([number, operation]) =>                    
        res.render('index', { numbers : number, operations : operation }));
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
        numbersRef.push({
            key : req.body.key,
            value : req.body.value
        }, function(err, res) {
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
        operationsRef.push({
            key : req.body.key,
            value : req.body.value
        }, function(err, res) {
            if(err) {
               console.log(err);
           } 
            req.res.redirect('/');
        });
    }
});

app.delete('/numbers/delete/:id', function(req, res){
    numbersRef.child(req.params.id).remove();
    req.res.redirect('/');
});

app.delete('/operations/delete/:id', function(req, res){
    operationsRef.child(req.params.id).remove();
    req.res.redirect('/');
});

app.listen(3000, function(){
    console.log("server started on port 3000...");
})
