import knex from '../utils/db.js'; // Kết nối cơ sở dữ liệu qua Knex

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

export default {
  findAll,
  countAll,
  findById,
  findPage,
  create,
  deleteById,
  findLatest,
};

