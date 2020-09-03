var express=require('express'); //引入express模块


var app=express();

var fortune=require('./lib/fortune.js');//引入自定义fortune模块


//引入handlerbars模板
var handlebars=require('express3-handlebars').create({
    defaultLayout:'main',//设置默认布局view\layouts\main.handlebars
    helpers:{
        section:function(name,options){
            if(!this._sections)this._sections={};
            this._sections[name]=options.fn(this);
            return null;
        }
    }
});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.set('port',process.env.PORT||3000);

//禁用express的报头
app.disable('x-powered-by');

// mocked weather data
function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}

//设置静态路径
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherContext = getWeatherData();
 	next();
});

//引入body-parser中间件
app.use(require('body-parser')());

app.get('/',function(req,res){
    res.render('home');
})

app.get('/about',function(req,res){
    res.render('about',{fortune:fortune.getFortune()});
})

//header infomationx 请求报头
app.get('/header',function(req,res){
    res.set('Content-Type','text/plain');
    var s='';
    for(var name in req.headers) s+=name+':'+req.headers[name]+'\n';
    res.send(s);
});

app.get('/jquerytest',function(req,res){
    res.render('jquerytest');
});

app.get('/nursery-rhyme', function(req, res){
	res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function(req, res){
	res.json({
		animal: 'squirrel',
		bodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck',
	});
});

app.get('/thank-you', function(req, res){
	res.render('thank-you');
});

//表单输入
app.get('/newsletter',function(req,res){
    res.render('newsletter',{csrf:'CSRF token goes here'});
});

app.post('/process',function(req,res){
    console.log('Form(from querystring):'+req.query.form);
    console.log('CSRF token(from hidden form field):'+req.body._crsf);
    console.log('Name(form visible from field):'+req.body.name);
    console.log('Email(from visible from field):'+req.body.email);
    res.redirect(303,'/thank-you');
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
