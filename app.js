const express = require('express');
const session = require('express-session');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: 'foo',
    saveUninitialized: false,
    resave: false,
}));

const index = (req, res) => {
    res.json({ data: 'Secret data: Only logged-in users can see this!' });
};

function isLoggedIn(req, res, next) {
    if (req.session.username) {
        return next();
    } else {
        res.redirect('/');
    }
}

const processLogin = (req, res) => {
    if (req.body.username === 'guest' && req.body.password === '123456') {
        req.session.username = req.body.username;
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ error: 'Invalid username and/or password' });
    }
};

app.post('/login', processLogin);
app.get('/articles', isLoggedIn, index);

app.listen(3200, () => {
});