var botId = "st-cc9bb099-9de4-5bd9-a337-1bfe3c3d7b58";
var botName = "Interactive HR Bot";
var sdk            = require("./lib/sdk");
var Promise        = sdk.Promise;
const https = require('https');
var { makeHttpCall } = require("./makeHttpCall");

var fs = require('fs');

function downloadURI(uri, fileName, cb) {
        console.log("Inside downloadURI...");
        uri = encodeURI(uri);
        var request = https.get(uri, function(response) {
            var file = fs.createWriteStream(fileName);
            response.pipe(file);
            file.on('finish', function() {
                file.close(cb); // close() is async, call cb after close completes. 
            });
        }).on('error', function(err) { // Handle errors fs.unlink(fileName); // Delete the file async. (But we don't check the result) 
            if (cb) cb(err.message);
        });
    }

async function callAttachmentFile(sys_id, attachmentObj) {
        return new Promise((resolve, reject) => {
            //var url = "https://" + ServiceNowConfig["instance_id"] + ServiceNowConfig["hostname"] + ServiceNowConfig["path"] + "attachment/file" + "?table_name=" + ServiceNowConfig["incident_table_name"] + "&table_sys_id=" + sys_id + "&file_name=" + attachmentObj.fileName;
			
			var url = "https://genpactdevelop.service-now.com/api/now/attachment/file?table_name=x_718750_inciden_0_incident_table&table_sys_id=" + sys_id + "&file_name=" + attachmentObj.fileName;
			
            console.log("Attachment URL : " + url); //console.log("sys_id : " + sys_id); console.log("contentUrl : " + attachmentObj.contentUrl); console.log("file Name : " + attachmentObj.fileName); console.log("contentType : " + attachmentObj.contentType); 
            var fileName = attachmentObj.fileName;
            downloadURI(attachmentObj.url.fileUrl, fileName, (error, success) => {
                console.log('call back.... ');
                if (error) {
                    console.error(err);
                    return;
                }
                fs.readFile(fileName, (err, data) => {
                    console.log("Writing data to binaryFile variable."); //binaryFile = data; 
					let headers = {
							'Authorization': 'Basic YWRtaW46MldDcD1Sc2wxWHYh',
                            'Content-Type': "image/jpeg"
					}
					
					makeHttpCall(
							'post',
							url,
							data,
							headers
					)
					.then(function(response) {
						resolve(response.data);
					})
					.catch(function(err) {
						return reject(err);
					})
                });
            })
        });
    }
	
module.exports = {
    botId   : botId,
    botName : botName,
     on_user_message : function(requestId, data, callback) {
        sdk.sendBotMessage(data, callback);
    },
    on_bot_message  : function(requestId, data, callback) {
        sdk.sendUserMessage(data, callback);
    },
    on_webhook      : async function(requestId, data, componentName, callback) 
    {
        var context = data.context;
		//var currentLanguage = _.get(data, 'context.session.BotUserSession.language_code');
		var currentLanguage = data.context.session.BotUserSession.language_code;
		console.log("currentLanguage : " + currentLanguage);
        console.log("componentName : " + componentName);
        if (componentName === 'webHookWeatherApp') {
			var cityName = data.context.entities.ent_city;
            context.weather = "Weather in " + cityName + " is 38 degree.";
			callback(null, data);
        }else if(componentName === 'serviceNowHook'){
			//logic will be here to attach file.
			
			//var incNumber = "ID0001006";
			//context.sys_id
			var incNumber = INC3339566;
			var sys_id = c5f2e1684703f514d83d3247e26d43f8;
			var attachmentObj = data.context.entities.getAttachment[0];
			console.log("attachmentObj : " + JSON.stringify(attachmentObj));
			callAttachmentFile(sys_id, attachmentObj)
                .then(function(attachmentDetails) {
					console.log("attachmentDetails : " + JSON.stringify(attachmentDetails));
                    data.context.attachmentDetails = attachmentDetails;
					
					context.fileAttachMessage = "File attached to " + incNumber + " successfully.";
                    callback(null, data);
            });
		}
    }
};