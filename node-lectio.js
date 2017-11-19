var http = require('http');
var url = require('url');
var crypto = require('crypto');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var lectioHelper = require('./lectio-helper');
var httpTools = require('./http-tools');

var server = http.createServer(function (req, res) {
    
    if(url.parse(req.url).query != null){
        qs = httpTools.splitQuery(url.parse(req.url).query);
        if(String(typeof(qs.elev)) != "undefined"){
            var type = "0";
            var person = qs.elev;
        }else if(String(typeof(qs.laerer)) != "undefined"){
            var type = "1";
            var person = qs.laerer;
        }

        var school = qs.skole;

        if(school == "" || !Number(school)){
            return;
        }

        if(String(typeof(qs.uger)) == "undefined"){
            var amount = 2;
        }else{
            var amount = Number(qs.uger);
        }

        if(Number(person) && Number(school)){
            res.writeHead(200, { 'content-type': 'text/json; charset=utf-8' });
            
            this.sequence++;
            lec = new lectio(res,amount,type,school,person);
            lec.generate(res);
        }else{
            res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
            res.end("PAGE NOT FOUND");
        }
    }
    else{
        res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
        res.end("PAGE NOT FOUND");
    }

});

function lectio(res,amount,type,school,person){
    this.res = res;
    this.school = school;
    this.person = person;
    this.amount = amount;
    this.type = type;
    var greenland = [354,539,362,988,803,364];
    if(greenland.indexOf(Number(this.school))>=0) this.skew = -4; //Change time to Greenland time
    else this.skew = 0;
    var now = new Date();
    this.startTime = now.getTime();
    this.nowTime = lectioHelper.dateFormat(now,0);
    if(Math.floor(now.getMinutes()/15)==0){
            var min = "00";
    }else{
            var min = Math.floor(now.getMinutes()/15)*15;
    }
    now.setUTCMinutes(min);
    now.setUTCSeconds(00);
    this.lastTime = lectioHelper.dateFormat(now,0);
    
    this.beginOutput = function(){
        begin = "BEGIN:VCALENDAR\r\n";
        begin += "VERSION:2.0\r\n";
        begin += "PRODID:-//EMILBA.CH//LECTIO//DA\r\n";
        begin += "CALSCALE:GREGORIAN\r\n";
        begin += "METHOD:PUBLISH\r\n";
        begin += "X-PUBLISHED-TTL:PT15M\r\n";
        begin += "X-WR-CALNAME:Lectio skema\r\n";
        begin += "X-WR-TIMEZONE:Europe/Copenhagen\r\n";
        return begin;
    }
    this.endOutput = function(){
        return "END:VCALENDAR\r\n";
    }

    this.finishedProcessing = function(add){
        var load = Number(new Date().getTime()) - Number(this.startTime);
        //console.log(load + "ms");
        //console.log(this.amount + ": " + this.type + " - " + this.school + " - " + this.person);
        server.storage.write("sequence", server.sequence,null);
        this.res.end(this.endOutput());
        server.loadTimes += load;
        server.amnt++;
    }

    this.processEvent = function(titleString,callback){

        var lines = titleString.split("\n");
        if(lines[0] == "Aflyst!"){
            lines.splice(0,1);
            var cancelled = true;
        }else if(lines[0] == "Ændret!"){ //&#198;ndret
            lines.splice(0,1);
            var changed = true;
        }       

        //check if date on line 0
        var re = /[0-9]+\/[0-9]+\-[0-9]+ [0-9]+:[0-9]+ til [0-9]+:[0-9]+/g;
        if(!re.test(lines[0])){ //Date not yet on line 0, fetch title
            var special = lines[0];
            lines.splice(0, 1);
        }

    
        /* TIME */
        var time = lines[0].split(" "); //As the date is always on line 0
        time[0] = time[0].replace(/\//g,"-").split("-");
        if(time[0][1].length == 1) time[0][1] = "0" + time[0][1];
        if(time[0][0].length == 1) time[0][0] = "0" + time[0][0];
        time[0] = time[0].reverse().join("-");
        var start = new Date(time[0] + " " + time[1]);
        if(time.length == 4) var end = new Date(time[0] + " " + time[3]);
        else{
            time[3] = time[3].replace(/\//g,"-").split("-");
            if(time[3][1].length == 1) time[3][1] = "0" + time[3][1];
            if(time[3][0].length == 1) time[3][0] = "0" + time[3][0];
            time[3] = time[3].reverse().join("-");
            var end = new Date(time[3] + " " + time[4]);
        }
        lines.splice(0,1);
            

        while(lines[0]!=undefined && lines[0]!=""){
                
            /* TEACHER */
            if(lines[0].substr(0,6) == "Lærer:"){
                var line = lines[0].split(": ");
                var regExp = /\(([^)]+)\)/;
                var teacher = regExp.exec(line[1])[1];
            }
            else if(lines[0].substr(0,7) == "Lærere:"){
                var line = lines[0].split(": ");
                var teacher = line[1].split(",").join("");
            }

                
            /* SUBJECT */
            else if(lines[0].substr(0,5) == "Hold:"){
                var line = lines[0].split(": ");
                var subject = line[1];
            }


            /* LOCATION */
            else if(lines[0].substr(0,7) == "Lokale:"){
                var line = lines[0].split(": ");
                var location = line[1];
                if(location.charCodeAt(location.length-1)=="13") location = location.substr(0,location.length-1);
            }
            else if(lines[0].substr(0,8) == "Lokaler:"){
                var line = lines[0].split(": ");
                var location = line[1].split(",").join("");
                if(location.charCodeAt(location.length-1)=="13") location = location.substr(0,location.length-1);
            }

            else if(lines[0].substr(0,5) == "Elev:" || lines[0].substr(0,7) == "Elever:" || lines[0].substr(0,9) == "Resource:" || lines[0].substr(0,10) == "Ressource:" || lines[0].substr(0,11) == "Ressourcer:"){
                //Unimportant
            }


            /* SPECIAL EVENT */
            else{
                var special = lines[0];
                if(String(typeof(special)) != "undefined"){
                    if(special.charCodeAt(special.length-1)=="13") special = special.substr(0,special.length-1);
                }
            }
            lines.splice(0,1);
                
        }
            
        while(lines.length>0 && (lines[0]=="" || lines[0].substr(0,6)=="Links:")){
            lines.splice(0,1);
        }

        var hw = '';
        var no = '';
        var descm = 0;
            
        if(lines.length>0 && lines[0]!=undefined){
                
            if(lines[0].substr(0,8) == "Lektier:"){
                lines.splice(0,1);
                while(lines[0]!=undefined && lines[0]!="Note:"){
                    var l = lines[0].replace(/\r?\n|\r/g,"");
                    hw += l + "\n";
                    lines.splice(0,1);
                }
                descm = descm+2;
            }

            if(lines.length>0 && lines[0].substr(0,5) == "Note:"){
                lines.splice(0,1);
                while(lines[0]!=undefined){
                    var l = lines[0].replace(/\r?\n|\r/g,"");
                    no += l + "\n";
                    lines.splice(0,1);
                }
                descm++;
            }

        }
        hw = lectioHelper.removePadding(hw);
        no = lectioHelper.removePadding(no);
        if(hw != "" && no != ""){
            var desc = no + "\n\n\n\n" + hw;
        }else if(no != ""){
            var desc = no;
        }else if(hw != ""){
            var desc = hw;
        }

        if(String(typeof(special)) == "undefined") var special = "";
        else special += " - ";
        if(String(typeof(teacher)) == "undefined") var teacher = "";
        else teacher += " - ";
        if(descm == 1) add = "N - ";
        else if (descm == 2) add = "L - ";
        else if (descm == 3) add = " - L:N - ";
        else add = ''; 
        if(String(typeof(subject)) != "undefined"){
            if(subject.charCodeAt(subject.length-1)=="13") subject = subject.substr(0,subject.length-1);
            subject = subject + " - ";
        }else{
            var subject = "";
        }
        
        var summary = special + subject + teacher + add;
        summary = summary.substr(0,summary.length-3);
        if(summary=="" && String(typeof(subject)) != "") summary += subject;

        o = "BEGIN:VEVENT" + "\r\n";
        o += "UID:" + crypto.createHash('md5').update(teacher + start + end).digest('hex') + "@emilba.ch" + "\r\n";
        o += "SEQUENCE:" + server.sequence + "\r\n"; //This is important, to push updates
        if(cancelled===true) o += "STATUS:CANCELLED" + "\r\n";
        o += "DTSTAMP:" + this.nowTime + "\r\n";
        o += "LAST-MODIFIED:" + this.lastTime + "\r\n";
        o += "DTSTART:" + lectioHelper.dateFormat(start,this.skew) + "\r\n";
        o += "DTEND:" + lectioHelper.dateFormat(end,this.skew) + "\r\n";
        o += "SUMMARY:" + entities.decode(summary) + "\r\n";
        if(String(typeof(location)) != "undefined") o += "LOCATION:" + location + "\r\n";
        if(descm>0) o += "DESCRIPTION:" + entities.decode(desc).replace(/\n/g,"\\n").replace(/\,/g,"\\,").replace(/\;/,"\\;") + "\r\n";
        o += "END:VEVENT" + "\r\n";
        callback(o);
    }

    this.generate = function(){
        this.res.write(this.beginOutput());
        if(this.type == "0"){
            var base = "http://www.lectio.dk/lectio/" + this.school + "/SkemaNy.aspx?type=elev&elevid=" + this.person + "&week=";
        }else{
            var base = "http://www.lectio.dk/lectio/" + this.school + "/SkemaNy.aspx?type=laerer&laererid=" + this.person + "&week=";
        }
        var da = new Date();
        var d = da.getTime();
        var y = da.getUTCFullYear();
        var w = lectioHelper.getWeekNumber(d+8.64e7);
        var l = this;
        var promises = [];
        for(x=0;x<this.amount;x++){
            var week = lectioHelper.getWeekNumber(d+x*604800000+8.64e7); //Add 1 day
            week = lectioHelper.pad(week);
            if(week >= w) var result = week + String(y);
            else var result = week + String(y+1);
            var promise = new Promise(function(resolve,reject){
                //console.log(base + result);
                http.get(base + result,function (resp){
                    if(resp.statusCode=="200"){
                        var body;
                        resp.setEncoding("utf8");
                        resp.on("data", function(data){
                            body += data;
                        });
                        resp.on("error", console.error);
                        resp.on("end", function(){
                            resolve(body);
                        });
                    }else{
                        if(l.loaded == 0){
                            console.log("Error " + resp.statusCode);
                        }                   
                    }
                });
            });
            promise.then(function(body){
                var cheerio = require("cheerio");
                $ = cheerio.load(body);
                l.els = l.els + $(".s2bgbox")["length"];
                $(".s2bgbox").each(function(i,item){
                    var promise = new Promise(function(resolve,reject){
                        l.processEvent(item.attribs["data-additionalinfo"],function(output){
                            resolve(output);
                        });
                    });
                    promise.then(function(output){
                        l.res.write(output);
                    });
                });
            });
            promises.push(promise);         
        }
        Promise.all(promises).then(function(){
            l.finishedProcessing();
        });
    }
}

server.storage = require("./storage");
server.sequence = Number(server.storage.read("sequence"));
server.amnt = 0;
server.loadTimes = 0;
server.listen(9002);
server.last = 0;

function runAnalytics(){
    var sequence = server.sequence;
    var date = new Date();
    console.log(date);
    console.log("Fetched " + server.amnt + " times since last analytics run. Total: " + sequence);
    var pt = (date.getTime() - server.last)/(1000*server.amnt);
    console.log("Avg time between fetches: " + pt + "s");
    console.log("Average load time: " + server.loadTimes/server.amnt + "ms\n");
    server.last = date.getTime();
    server.amnt = 0;
    server.loadTimes = 0;
}
function cron(interval){
    runAnalytics();
    setTimeout(function(){cron(interval);}, interval*1000);
}
cron(3600);
