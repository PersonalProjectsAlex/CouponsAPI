import dotenv from 'dotenv';
import crypto from 'crypto';
var f_request = require('request');
var parseString = require('xml2js').parseString;
dotenv.config()
const access_key = process.env.ACCESS_KEY;
const secret_key = process.env.SECRET_KEY;
const associate_tag = process.env.ASSOCIATE_TAG;

/* GET Signature for Amazon Request */
function signature(req, res, next) {
    let date = new Date();
    date = date.toISOString()
    date = date.replace(/\.[0-9]{2,3}/, '');
    
    //let data = "AWSAccessKeyId="+access_key+"&AssociateTag="+AssociateTag+"&Condition="+req.body.Condition+"&Operation="+req.body.Operation+"&ResponseGroup="+req.body.ResponseGroup+"&SearchIndex="+req.body.SearchIndex+"&Service="+req.body.Service+"&Timestamp="+date+"&Title="+req.body.Title+"&Version="+req.body.Version;
    let data = "AWSAccessKeyId="+access_key+"&AssociateTag="+associate_tag+"&Keywords="+req.body.Keywords+"&Operation=ItemSearch&ResponseGroup=OfferListings,Images,ItemAttributes&SearchIndex=All&Service=AWSECommerceService&Timestamp="+date;
    
    data = encodeURIComponent(data);
    data = data.replace(/%3D/g, "=");
    data = data.replace(/%26/g, "&");
    
    let request = "GET"+"\n"+"webservices.amazon.com"+"\n"+"/onca/xml"+"\n"+ data;
    let signature = crypto.createHmac('sha256', secret_key).update(request).digest('base64');
    signature = encodeURIComponent(signature);
    let url=`http://webservices.amazon.com/onca/xml?`+data+`&Signature=`+signature;
    f_request.get(url, function (err, response, body) {
        if (err) res.status(500).json({'err': err});
        parseString(body, function (err, result) {
            let list_items =  result.ItemSearchResponse.Items[0].Item;
            let items = [];
            let item = {};
            list_items.forEach((i) => {
                item["DetailPageURL"]=i.DetailPageURL[0];
                item["ItemLinks"]=i.ItemLinks[0];
                item["LargeImage"]=i.LargeImage[0].URL[0];
                item["ItemAttributes"]=i.ItemAttributes[0];
                if(i.Offers[0].Offer){
                    console.log(i.Offers[0].Offer[0].OfferListing[0]);
                    item["Offer"]=i.Offers[0].Offer[0].OfferListing[0];
                    items.push(item);
                }
                
            });
            //console.log(items);
            return res.status(200).json({'json': items});
        });
      });
}

export default { signature }