//Sites of brands with logos, used for phising detection using the red flag approach
//diagDistance is irrelevant for now, can be skipped for any new logo added.
var redFlagSites = [
    {"templateName":"Facebook", "site": "Facebook", "logo": "assets/img/fb-logo_lnx.png", "diagDist": 202, "enabled":true, "type": "default", "url": "https://www.facebook.com/" },
    { "templateName":"Facebook old","site": "Facebook", "logo": "assets/img/fb-old.png", "diagDist": 121 , "enabled":true, "type": "default", "url": "https://www.facebook.com/"},
    { "templateName":"Paypal","site": "Paypal", "logo": "assets/img/paypal-linux.png", "diagDist":156 , "enabled":true, "type": "default", "url": "https://www.paypal.com/in/signin"},
    { "templateName":"ICICI Bank","site": "ICICI", "logo": "assets/img/icici-shot.png", "diagDist": 195 , "enabled":true, "type": "default", "url": "https://infinity.icicibank.com/corp/AuthenticationController"},
    { "templateName":"HDFC bank","site": "HDFC", "logo": "assets/img/hdfc-screen.png", "diagDist":158 , "enabled":true, "type": "default", "url": "https://netbanking.hdfcbank.com/netbanking"},
    { "templateName":"IDBI Bank","site": "IDBI", "logo": "assets/img/idbi-linux.png", "diagDist":217 , "enabled":true, "type": "default"},
    { "templateName":"Dropbox","site": "Dropbox", "logo": "assets/img/db-logo.png", "diagDist":57 , "enabled":true, "type": "default", "url": "https://dropbox.com/"},
    { "templateName":"Google 2017","site": "Google", "logo": "assets/img/google-logo.png", "diagDist":90 , "enabled":true, "type": "default", "url": "https://accounts.google.com/ServiceLogin"},
    { "templateName":"Google 2016","site": "Google", "logo": "assets/img/google-old.png", "diagDist":129 , "enabled":true, "type": "default", "url": "https://accounts.google.com/ServiceLogin"}
];

//Sites that are used for greenflag approach. Can be modified by a user
var whiteListedURLs = [ "https://accounts.google.com/ServiceLogin", "https://www.facebook.com/", "https://www.paypal.com/signin", "https://infinity.icicibank.com/corp/AuthenticationController", "https://netbanking.hdfcbank.com/netbanking", "https://dropbox.com/"];

//Domains/sites that are skipped completely for red flaf approach.
var skipDomains = [ "google.com", "facebook.com", "google.co.in", "paypal.com", "icicibank.com", "hdfcbank.com", "dropbox.com"];
