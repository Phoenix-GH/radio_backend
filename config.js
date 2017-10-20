module.exports = {

    'secret': 'ilovenodejs',
    //Development
    //'database': 'mongodb://hiromihara:hiromihara@ds139899.mlab.com:39899/radioish',
 	//Production
 	'database': 'mongodb://dave:qwerty123456@ds139242.mlab.com:39242/radioish',
 	'accessKeyId': 'AKIAIRUCN2ESPJFWNJAQ',
 	'secretAccessKey': '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',
 	'image_bucket': 'radioish-image',
 	'audio_bucket': 'radioish-audio',
 	'region': 'us-west-2',
 	'sns_region': 'us-east-1',
 	'domain': 'https://s3-us-west-2.amazonaws.com/',
 	'cfDomain': 'd2yvuhx6i6x478.cloudfront.net',
 	'cloudfrontKeyId': "APKAICFTCOWETGXRS7AQ",
 	'cloudfrontKeySecret': '-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi8XFqZmPP/xR50X7Kr2t/M82QS3BxAqAv65/g+eq9T0Um8qONo/cYJ2xKa+WVPWgj6GjnC8JwWgdi6TU7YQW4e+nz4ZLTKNOrngfpQKGGUfkUjIaMlaI6mSkFVpxF3qCXjQ9q1HwF6ru0Z45gh/Fo6e+uEB7ZyL1ALp1NMXxktGhr+zVq4Ag6SZYXH39r3bnKKL9iwgKu6TfG7f1F3bzURCpxSTYd0Cl8FS47/vreOnHPDOOOqXE/U1zIzqwBEv9KGvoWKnlHxvCHKBPVre3gDalYCqeXqib8zuzXU28t4xpd4Twlw1UTuiva5PPMlGqTnpvT0oKBsWYycT5xYTpHwIDAQAB-----END PUBLIC KEY-----',
 	'apns_arn_dev': 'arn:aws:sns:us-east-1:233293807373:app/APNS_SANDBOX/Radioish',
 	'apns_arn_prod': 'arn:aws:sns:us-east-1:233293807373:app/APNS/Radioish-Production',
 	'page_size' : 50 
};