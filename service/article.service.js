import knex from '../utils/db.js'; // Kết nối cơ sở dữ liệu qua Knex

// Fetch latest articles (Lấy các bài viết mới nhất)
const getLatestArticles = async () => {
  try {
    const latestArticles = await knex('articles')
      .orderBy('created_at', 'desc') // Sắp xếp theo ngày tạo, bài viết mới nhất lên đầu
      .limit(10); // Giới hạn số lượng bài viết (10 bài mới nhất)
    return latestArticles;
  } catch (error) {
    console.error('Lỗi khi lấy các bài viết mới nhất:', error);
    throw new Error('Lỗi khi lấy bài viết mới nhất');
  }
};
// Fetch top viewed articles (Lấy các bài viết xem nhiều nhất)
const getTopViewedArticles = async () => {
  try {
    const topViewedArticles = await knex('articles')
      .orderBy('views', 'desc') // Sắp xếp theo lượt xem
      .limit(10); // Giới hạn số lượng bài viết (10 bài xem nhiều nhất)
    return topViewedArticles;
  } catch (error) {
    console.error('Lỗi khi lấy các bài viết xem nhiều nhất:', error);
    throw new Error('Lỗi khi lấy bài viết xem nhiều nhất');
  }
};
// Fetch top articles in each category (Lấy các bài viết mới nhất trong mỗi chuyên mục)
const getTopArticlesByCategory = async () => {
  try {
    const categories = await knex('categories').limit(10); // Lấy 10 chuyên mục
    const topArticlesByCategory = [];

    for (const category of categories) {
      const article = await knex('articles')
        .where('category_id', category.id)
        .orderBy('created_at', 'desc') // Lấy bài viết mới nhất trong mỗi chuyên mục
        .first(); // Chỉ lấy bài viết đầu tiên (mới nhất)

      if (article) {
        topArticlesByCategory.push({
          category,
          article
        });
      }
    }

    return topArticlesByCategory;
  } catch (error) {
    console.error('Lỗi khi lấy bài viết mới nhất theo chuyên mục:', error);
    throw new Error('Lỗi khi lấy bài viết mới nhất theo chuyên mục');
  }
};


const incrementView = async (articleId) => {
  console.log(`Cập nhật lượt xem cho bài viết với ID: ${articleId}`);

  try {
    const article = await knex('articles').where('id', articleId).first();
    if (!article) {
      console.log(`Không tìm thấy bài viết với ID: ${articleId}`);
      return;
    }

    await knex('articles')
      .where('id', articleId)
      .increment('views', 1);
    
    console.log(`Lượt xem bài viết với ID: ${articleId} đã được cập nhật`);
  } catch (err) {
    console.error('Lỗi khi cập nhật lượt xem:', err);
    throw new Error('Lỗi khi cập nhật lượt xem');
  }
};
const findLatest = async (limit = 6) => {
  try {
    const rows = await knex('articles')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit);
    return rows;
  } catch (err) {
    console.error('Lỗi khi lấy bài viết mới nhất:', err);
    throw new Error('Lỗi khi lấy bài viết mới nhất');
  }
};

const deleteById = async (id) => {
  try {
    const rowsDeleted = await knex('articles').where('id', id).del();
    if (rowsDeleted === 0) {
      throw new Error(`Không tìm thấy bài viết với ID: ${id}`);
    }
    console.log(`Xóa bài viết thành công với ID: ${id}`);
    return rowsDeleted;
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error);
    throw error;
  }
};

const create = async (articleData) => {
  try {
    const [insertId] = await knex('articles').insert(articleData);
    const newArticle = await knex('articles').where('id', insertId).first();
    return newArticle;
  } catch (err) {
    console.error('Lỗi khi lưu bài viết:', err);
    throw new Error('Lỗi khi lưu bài viết');
  }
};
const update = async (articleId, updateData) => {
  try {
    // Cập nhật bài viết dựa trên ID
    await knex('articles').where('id', articleId).update(updateData);

    // Lấy lại bài viết đã cập nhật
    const updatedArticle = await knex('articles').where('id', articleId).first();

    return updatedArticle;
  } catch (err) {
    console.error('Lỗi khi cập nhật bài viết:', err);
    throw new Error('Lỗi khi cập nhật bài viết');
  }
};
const findAll = async () => {
  try {
    const rows = await knex('articles')
      .join('categories', 'articles.category_id', '=', 'categories.id')
      .select(
        'articles.id',
        'articles.title',
        'articles.author',
        'articles.abstract',
        'articles.content',
        'articles.is_premium',
        'categories.category_name'
      );
    return rows;
  } catch (err) {
    console.error(err);
    throw new Error('Lỗi khi lấy danh sách bài viết');
  }
};
const countAll = async () => {
  try {
    const result = await knex('articles').count('* as total');
    return result[0];
  } catch (err) {
    console.error(err);
    throw new Error('Lỗi khi đếm số bài viết');
  }
};

const findById = async (articleId) => {
  try {
    const row = await knex('articles')
      .join('categories', 'articles.category_id', '=', 'categories.id')
      .select(
        'articles.id',
        'articles.title',
        'articles.author',
        'articles.abstract',
        'articles.content',
        'articles.is_premium',
        'categories.category_name'
      )
      .where('articles.id', articleId)
      .first();
    return row;
  } catch (err) {
    console.error(err);
    throw new Error('Lỗi khi lấy chi tiết bài viết');
  }
};
const findByCategory = async (categoryId) => {
  try {
    const rows = await knex('articles')
      .join('categories', 'articles.category_id', '=', 'categories.id')
      .select(
        'articles.id',
        'articles.title',
        'articles.author',
        'articles.abstract',
        'articles.content',
        'articles.is_premium',
        'articles.views',
        'categories.category_name'
      )
      .where('categories.id', categoryId);

    return rows;
  } catch (err) {
    console.error(err);
    throw new Error('Lỗi khi lấy danh sách bài viết theo danh mục');
  }
};
const findTop5ByCategory = async (categoryId) => {
  try {
    const rows = await knex('articles')
      .join('categories', 'articles.category_id', '=', 'categories.id')
      .select(
        'articles.id',
        'articles.title',
        'articles.author',
        'articles.abstract',
        'articles.content',
        'articles.is_premium',
        'categories.category_name'
      )
      .where('articles.category_id', categoryId)
      .orderBy('articles.views', 'desc') // Sắp xếp giảm dần theo lượt xem
      .limit(5); // Giới hạn chỉ lấy 5 bài viết

    return rows;
  } catch (err) {
    console.error(err);
    throw new Error('Lỗi khi lấy danh sách bài viết theo danh mục và lượt xem');
  }
};
const findPage = async (limit, offset) => {
  try {
    const rows = await knex('articles')
      .join('categories', 'articles.category_id', '=', 'categories.id')
      .select(
        'articles.id',
        'articles.title',
        'articles.author',
        'articles.abstract',
        'articles.content',
        'articles.is_premium',
        'categories.category_name'
      )
      .limit(limit)
      .offset(offset);
    return rows;
  } catch (err) {
    console.error(err);
    throw new Error('Lỗi khi lấy bài viết phân trang');
  }
};
const getTopArticlesThisWeek = async () => {
  return knex('articles')
    .where('created_at', '>', knex.raw('NOW() - INTERVAL 7 DAY'))
    .orderBy('views', 'desc')
    .limit(4);
};
const getTopCategories = async () => {
  const categories = await knex('categories').limit(10); // Lấy 10 chuyên mục đầu tiên
  const topCategories = [];
  for (const category of categories) {
    const topArticle = await knex('articles')
      .where('category_id', category.id)
      .orderBy('views', 'desc')
      .first();
      
    if (topArticle) {
      topCategories.push({
        category,
        article: topArticle
      });
    }
  }
  return topCategories;
};
const getCategories = async () => {
  try {
    // Truy vấn tất cả các chuyên mục, sắp xếp theo `id` tăng dần.
    const rows = await knex('categories')
      .select('id', 'category_name', 'parent_id')
      .orderBy('id', 'asc');

    const categories = {}; // Đối tượng để nhóm chuyên mục

    // Đảm bảo nhóm `null` luôn tồn tại
    categories[null] = [];

    // Duyệt qua từng hàng (row) trong kết quả
    rows.forEach(row => {
      const { id, category_name, parent_id } = row;

      // Nếu chưa có nhóm `parent_id` trong `categories`, khởi tạo mảng rỗng
      if (!categories[parent_id]) {
        categories[parent_id] = [];
      }

      // Thêm chuyên mục vào nhóm tương ứng
      categories[parent_id].push({ id, category_name });
    });

    return categories; // Trả về danh sách chuyên mục dạng cây
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};
export default {
  findAll,
  countAll,
  findById,
  findPage,
  create,
  deleteById,
  findLatest,
  incrementView,
  getLatestArticles,
  getTopViewedArticles,
  getTopArticlesByCategory,
  getTopArticlesThisWeek,
  getTopCategories,
  getCategories,
  findByCategory,
  findTop5ByCategory,
  update,
};
