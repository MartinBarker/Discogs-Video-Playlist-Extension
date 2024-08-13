require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const path = require('path');
const Discogs = require('disconnect').Client;
const OAuth = require('oauth').OAuth;

const app = express();
const port = 3000;

// Your Discogs app credentials from environment variables
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;

// Set up OAuth
const oa = new OAuth(
    'https://api.discogs.com/oauth/request_token',
    'https://api.discogs.com/oauth/access_token',
    consumerKey,
    consumerSecret,
    '1.0A',
    'http://localhost:3000/callback',
    'HMAC-SHA1'
  );
  
  let discogsRequestData = {};
  
  // Serve static files (HTML, CSS, JS)
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Serve index.html at the root URL
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
  // Serve the login page
  app.get('/login', (req, res) => {
    oa.getOAuthRequestToken((error, oauthToken, oauthTokenSecret, results) => {
      if (error) {
        console.error('Error getting OAuth request token:', error);
        res.send('Error getting OAuth request token');
      } else {
        console.log('OAuth Request Token received:', oauthToken);
        console.log('OAuth Token Secret received:', oauthTokenSecret);
        
        discogsRequestData = { oauthToken, oauthTokenSecret };
        const authUrl = `https://discogs.com/oauth/authorize?oauth_token=${oauthToken}`;
        res.redirect(`/auth.html?authUrl=${encodeURIComponent(authUrl)}`);
      }
    });
  });
  
  // Handle the OAuth callback
  app.get('/callback', (req, res) => {
    const { oauth_token, oauth_verifier } = req.query;
    const { oauthTokenSecret } = discogsRequestData;
  
    console.log('OAuth Callback triggered');
    console.log('OAuth Token from callback:', oauth_token);
    console.log('OAuth Verifier from callback:', oauth_verifier);
    console.log('Stored OAuth Token Secret:', oauthTokenSecret);
  
    oa.getOAuthAccessToken(
      oauth_token,
      oauthTokenSecret,
      oauth_verifier,
      (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
        if (error) {
          console.error('Error getting OAuth access token:', error);
          res.send('Error getting OAuth access token');
        } else {
          console.log('OAuth Access Token received:', oauthAccessToken);
          console.log('OAuth Access Token Secret received:', oauthAccessTokenSecret);
          
          // Store the access tokens securely
          const discogsClient = new Discogs({
            consumerKey,
            consumerSecret,
            accessToken: oauthAccessToken,
            accessSecret: oauthAccessTokenSecret,
          });
  
          // Example API request to get images from a release
          const releaseId = 176126;  // Replace with the desired release ID
          const db = discogsClient.database();
  
          db.getRelease(releaseId, (err, data) => {
            if (err) {
              console.error('Error fetching release:', err);
              res.send('Error fetching release');
            } else {
              if (data.images && data.images.length > 0) {
                const imageUrl = data.images[0].resource_url;
                res.send(`<h1>Image URL: ${imageUrl}</h1><img src="${imageUrl}" alt="Release Image">`);
              } else {
                res.send('<h1>No images found for this release.</h1>');
              }
            }
          });
        }
      }
    );
  });
  
  // Listen on the specified port
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });