const db = require('../../config/db.js')

exports.getAll = async() => {
  try {
    const sql = 'SELECT * FROM books where status = 1 and stock_quantity > 0';
    const [rows] = await db.query(sql);
    return rows;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

exports.getById = (id) => products.find(p => p.id == id);

exports.add = (product) => {
  const newId = products.length + 1;
  products.push({ id: newId, ...product });
};

exports.update = (id, updatedProduct) => {
  const index = products.findIndex(p => p.id == id);
  if (index !== -1) {
    products[index] = { id: Number(id), ...updatedProduct };
  }
};

exports.delete = (id) => {
  products = products.filter(p => p.id != id);
};
