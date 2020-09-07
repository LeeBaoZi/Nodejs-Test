var express=require('express'); //引入express模块

var app=express();

var fortune=require('./lib/fortune.js');//引入自定义fortune模块

var credentials = require('./credentials.js');


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

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());

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

// for now, we're mocking NewsletterSignup:
function NewsletterSignup(){
}
NewsletterSignup.prototype.save = function(cb){
	cb();
};

//设置静态路径
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherContext = getWeatherData();
 	next();
});

//引入body-parser中间件
app.use(require('body-parser')());

// flash message middleware
app.use(function(req, res, next){
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

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

//表单处理
/*
app.post('/process',function(req,res){
    console.log('Form(from querystring):'+req.query.form);
    console.log('CSRF token(from hidden form field):'+req.body._crsf);
    console.log('Name(form visible from field):'+req.body.name);
    console.log('Email(from visible from field):'+req.body.email);
    res.redirect(303,'/thank-you');
});
*/

//AJAX表单输入
app.get('/newsletterAJAX',function(req,res){
    res.render('newsletterAJAX',{csrf:'CSRF token goes here'});
});

//AJAX表单处理
app.post('/process',function(req,res){
    console.log(req.xhr);
    if(req.xhr||req.accepts('json,html')==='json'){
        console.log('AJAX Success'),
        res.send({success:true});
    }else{
        console.log('303'),
        res.redirect(303,'/thank-you');
    }
});

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.post('/newsletterAJAX', function(req, res){
	var name = req.body.name || '', email = req.body.email || '';
	// input validation
	if(!email.match(VALID_EMAIL_REGEX)) {
		if(req.xhr) return res.json({ error: 'Invalid name email address.' });
		req.session.flash = {
			type: 'danger',
			intro: 'Validation error!',
			message: 'The email address you entered was  not valid.',
		};
		return res.redirect(303, '/newsletterAJAX/archive');
	}
	new NewsletterSignup({ name: name, email: email }).save(function(err){
		if(err) {
			if(req.xhr) return res.json({ error: 'Database error.' });
			req.session.flash = {
				type: 'danger',
				intro: 'Database error!',
				message: 'There was a database error; please try again later.',
			};
			return res.redirect(303, '/newsletterAJAX/archive');
		}
		if(req.xhr) return res.json({ success: true });
		req.session.flash = {
			type: 'success',
			intro: 'Thank you!',
			message: 'You have now been signed up for the newsletter.',
		};
		return res.redirect(303, '/newsletterAJAX/archive');
	});
});
app.get('/newsletterAJAX/archive', function(req, res){
	res.render('newsletterAJAX/archive');
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
