import express from 'express';
import bcrypt from 'bcryptjs';
import moment from 'moment';

import userService from '../service/user.service.js';

const router = express.Router();

router.get('/register', function (req, res) {
  res.render('vwAccount/register');
});

router.post('/register', async function (req, res) {
  const hash_password = bcrypt.hashSync(req.body.raw_password, 8);
  const ymd_dob = moment(req.body.raw_dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
  const entity = {
    username: req.body.username,
    password: hash_password,
    name: req.body.name,
    email: req.body.email,
    dob: ymd_dob, // YYYY-MM-DD
    permission: 3
  }
  const ret = await userService.add(entity);
  res.render('vwAccount/register');
});

router.get('/login', function (req, res) {
  res.render('vwAccount/login');
});

router.post('/login', async function (req, res) {
  const user = await userService.findByUsername(req.body.username);
  if (!user) {
    return res.render('vwAccount/login', {
      has_errors: true
    });
  }
  else{
    req.session.user = {
      id: user.id,
      name: user.name,
      username: user.username // Bạn có thể lưu bất kỳ thông tin nào cần thiết
    };

  }

  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.render('vwAccount/login', {
      has_errors: true
    });
  }

  req.session.auth = true;
  req.session.authUser = user;
  const retUrl = req.session.retUrl || '/';
  req.session.retUrl = null;
  res.redirect(retUrl);
});

router.get('/is-available', async function (req, res) {
  const username = req.query.username;
  const ret = await userService.findByUsername(username);
  if (!ret) {
    return res.json(true);
  }
  res.json(false);
});

import { isAuth, isAuth1 } from '../middlewares/auth.mdw.js';

router.get('/profile', isAuth1, function (req, res) {
  res.render('vwAccount/profile', {
    layout: 'main',
    user: req.session.authUser
  });
});
router.post('/profile', isAuth1, async function (req, res) {
  try {
    // Lấy thông tin từ form (ví dụ, tên người dùng, email)
    const { name, email } = req.body;

    // Cập nhật thông tin người dùng trong cơ sở dữ liệu (giả sử bạn có service để xử lý)
    const updatedUser = await userService.updateUserProfile(req.session.authUser.id, { name, email });

    // Cập nhật thông tin người dùng trong session sau khi thay đổi
    req.session.authUser.name = updatedUser.name;
    req.session.authUser.email = updatedUser.email;

    // Hiển thị thông báo thành công và chuyển hướng về trang hồ sơ
    res.render('vwAccount/profile', {
      user: req.session.authUser,
      message: 'Profile updated successfully!'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ:', error);
    res.status(500).send('Lỗi khi cập nhật hồ sơ');
  }
});
router.get('/update-password', isAuth1, function (req, res) {
  res.render('vwAccount/update-password', {
    user: req.session.authUser
  });
});

router.post('/logout', function (req, res) {
  req.session.auth = false;
  req.session.authUser = null;
  req.session.retUrl = null;
  res.redirect('/articles/home');
});

export default router;
