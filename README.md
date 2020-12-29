# web-push-notifications

Please read the article here for more details: https://medium.com/javascript-in-plain-english/creating-a-push-notification-system-with-service-workers-e3e1813f2b5

# Instructions
1. Please ensure you create the right security around sending notifications to users. I have put a route in this on /send-notification as an example, but you should have appropriate security so not just anyone can send notifications to all your users
2. You need to generate your own vapid keys, you can do that by doing the following in terminal:
```npm i web-push -g
web-push generate-vapid-keys```
3. You will need to insert these vapid keys into index.js, and views/script.js