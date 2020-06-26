var express=require('express');


var app=express();

var fortune=require('./lib/fortune.js');

var handlebars=require('express3-handlebars').create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.set('port',process.env.PORT||3000);

app.get('/',function(req,res){
    res.render('home');
})
app.get('/about',function(req,res){
    res.render('about',{fortune:fortune.getFortune()});
})

//header infomation
app.get('/header',function(req,res){
    res.set('Content-Type','text/plain');
    var s='';
    for(var name in req.headers) s+=name+':'+req.headers[name]+'\n';
    res.send(s);
});

//404 page
app.use(function(req,res,next){
    res.status(404);
    res.render('404');
});

//505page
app.use(function(err,req,res,next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'),function(){
    console.log('Express started on http://localhost:'+app.get('port')+';press Ctrl-C to terminate');
});
