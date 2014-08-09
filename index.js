var nodemailer = require('nodemailer');
var ect = require('ect');
require('sugar')

module.exports = function(options, ect_options){
	var mail = nodemailer.createTransport(options);
	
	var ect_options = ect_options || {};
	var template_path = options.templates || (process.cwd + '/mail/');
	var html = ect(Object.merge({ 
		root : template_path, 
		ext: '.html', 
		open: '{{', close: '}}',
		cache: true,
		watch: true,
		gzip: true,
	}, ect_options));
	
	return function(locals, callback){
		// Render HTML Template
		html.render(template_path + locals.template, locals, function (error, html_contents) {
			if(!isset(error)){ 
				if(locals.from){
					var from = locals.author ? locals.author + ' <'+locals.from+'>' : locals.from ;
				} else {
					var from = options.from ? options.from + ' <'+options.auth.user+'>' : options.auth.user ;
				}
				var sendMailOptions = merge({
				    from	: from,
				    to		: locals.to,
				    subject	: locals.subject,
				    html	: html_contents,
				    generateTextFromHTML: true
				}, locals);
				delete sendMailOptions.template;
				mail.sendMail(sendMailOptions, function(error, info){
				    if(error){
				        throw error;
				    } else {
				    	if(callback) callback(info);
				    }
				});
			} else {
				throw error;
			}
		});
	}
}