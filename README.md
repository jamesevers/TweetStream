# TweetStream

### Getting up and running:

#### Before running the project locally, you'll need to sign up for the Twitter API in order to be granted access keys.

#### 1. Clone this repo, and in the root of the project directory, create a file named ```twitter-credentials.json```.
#### 2. Visit [Twitter's developer site](https://apps.twitter.com/) and click 'create new app'. Twitter will generate an access token key, an secret token, a consumer key, and a secret consumer token.
#### 3. Replace the X's in the example below with your Twitter API keys, and save the file.


twitter-credentials.json
```javascript
{
        "access_token_key": "XXXX-XXXXXX",
        "access_token_secret": "XXXXXXX",
        "consumer_key": "XXXXXXX",
        "consumer_secret": "XXXXXXX"
}


```


#### Once you've taken care of that, you should be up and running locally after executing the commands below. 


```
1. npm install
```

```
2. grunt watch
```

```
3. npm run start
```
