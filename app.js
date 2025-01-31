const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));
const jwt = require("jsonwebtoken");
const key = "Some super secret key shhhhhhhhhhhhhhhhh!!!!!";

const session = require('express-session');
app.use(session({
secret: 'foo',
saveUninitialized: false,
resave: false
}))

const index = (req, res) => {
    res.json({ data: 'secret data' });
};

const isLoggedIn = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            const data = jwt.verify(token, key);
            console.log('The logged in user is: ' + data.username);
            return next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid Token" });
        }
    } else {
        return res.status(403).json({ error: 'Token required' });
    }
};

const processLogin = (req, res) => {
    let attempts = 0;

    if (req.cookies.attempts) {
        attempts = parseInt(req.cookies.attempts);
    }

    if (attempts >= 3) {
        return res.status(400).json({ error: 'Too many failed attempts.' });
    }

    if (req.body.username === 'guest' && req.body.password === '123456') {
        const data = { username: req.body.username };
        const token = jwt.sign(data, key);
        res.cookie('attempts', 0, { 
            httpOnly: true, 
            SameSite: 'None',
        });
        res.status(201).json({ token });
    } else {
        res.cookie('attempts', attempts + 1, { 
            httpOnly: true, 
            maxAge: 3600000, 
            SameSite: 'None', 
            Secure: true 
        });
        res.status(404).json({ error: 'Invalid username and/or password' });
    }
};

app.post('/login', processLogin);
app.get('/', isLoggedIn, index);

app.listen(3200);