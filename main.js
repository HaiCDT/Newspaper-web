import express from 'express';
import { engine } from 'express-handlebars';
import numeral from 'numeral';
import session from 'express-session';
import path from 'path';
import bodyParser from 'body-parser';
const app = express();

// Middleware để phân tích cú pháp JSON
app.use(bodyParser.json());

// Middleware để phân tích cú pháp dữ liệu URL-encoded
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'SECRET_KEY',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}))

app.use(express.urlencoded({
  extended: true
}));

import hbs_section from 'express-handlebars-sections';
app.engine('hbs', engine({
  extname: 'hbs',
  helpers: {
    format_number(value) {
      return numeral(value).format('0,0') + ' vnd';
    },
    fillHtmlContent: hbs_section()
  }
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use('/uploads', express.static('uploads'));
app.use('/articles', articlesRouter);
app.get('/', (req, res) => res.redirect('/articles/home'));
import articlesRouter from './routes/articles.route.js';
app.use('/account', accountRouter);
import accountRouter from './routes/account.route.js';
app.listen(3000, function () {
  console.log('Server started on http://localhost:3000');
});
