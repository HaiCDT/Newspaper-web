import express from 'express';
import articleService from '../service/article.service.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' })
const router = express.Router();
router.post('/create', upload.single('image'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})
router.get('/home', async (req, res) => {
  try {
    // Fetch latest articles
    const articles = await articleService.findLatest(6); // Lấy 6 bài viết mới nhất
    res.render('articles/home', {
      articles,
      layout: 'main'
    });
  } catch (error) {
    console.error('Lỗi khi tải trang chủ:', error);
    res.status(500).send('Lỗi khi tải trang chủ');
  }
});
router.get('/create', (req, res) => {
  res.render('articles/create', {
    layout: 'main' // Dùng layout main.hbs
  });
});
// Route: Xóa bài viết
router.post('/delete/:id', async (req, res) => {
  const articleId = parseInt(req.params.id);
  try {
    // Gọi service để xóa bài viết theo ID
    await articleService.deleteById(articleId);
    // Chuyển hướng về danh sách bài viết sau khi xóa thành công
    res.redirect('/articles');
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error);
    res.status(500).send('Lỗi khi xóa bài viết');
  }
});
// Route: Lưu bài viết mới vào cơ sở dữ liệu
router.post('/create', async (req, res) => {
  const { title, author, category_id, content , abstract} = req.body;
  const is_premium = req.body.is_premium === 'on'; // Lấy giá trị checkbox
  try {
    // Lưu bài viết mới vào cơ sở dữ liệu
    const newArticle = await articleService.create({
      title,
      author,
      category_id,
      content,
      is_premium,
      abstract,
    });
    // Chuyển hướng đến trang bài viết sau khi lưu thành công
    res.redirect(`/articles/${newArticle.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi tạo bài viết');
  }
});
// Route: Hiển thị danh sách bài viết với phân trang
router.get('/', async (req, res) => {
  try {
    const limit = 1000;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const articles = await articleService.findPage(limit, offset); // Lấy bài viết với phân trang
    const nRows = await articleService.countAll(); // Đếm tổng số bài viết
    const nPages = Math.ceil(nRows.total / limit); // Tính tổng số trang
    const page_items = [];
    for (let i = 1; i <= nPages; i++) {
      const item = {
        value: i,
        isActive: i === page
      };
      page_items.push(item);
    }

    res.render('articles/list', {
      articles: articles,
      empty: articles.length === 0,
      page_items: page_items,
      currentPage: page
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi lấy danh sách bài viết');
  }
});

// Route: Hiển thị chi tiết bài viết
router.get('/detail', async (req, res) => {
  const id = parseInt(req.query.id) || 0;
  const article = await articleService.findById(id); // Lấy chi tiết bài viết theo ID
  if (!article) {
    return res.status(404).send('Bài viết không tồn tại');
  }
  res.render('articles/detail', { article: article });
});
router.get('/:id', async (req, res) => {
  const articleId = parseInt(req.params.id); // Lấy ID từ URL

  try {
    // Gọi service để lấy bài viết theo ID
    const article = await articleService.findById(articleId);

    // Kiểm tra nếu không tìm thấy bài viết
    if (!article) {
      return res.status(404).send('Bài viết không tồn tại');
    }

    // Render trang chi tiết bài viết
    res.render('articles/detail', { article },
      {
        layout: 'detail_content' // Dùng layout main.hbs
      }
    );
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết bài viết:', error);
    res.status(500).send('Lỗi khi lấy chi tiết bài viết');
  }
});
export default router;
