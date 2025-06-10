

// Write a query to find books that are both in stock and published after 2010
// - Use projection to return only the title, author, and price fields in your queries
// - Implement sorting to display books by price (both ascending and descending)
// - Use the `limit` and `skip` methods to implement pagination (5 books per page)

const findBooks = async (db, page = 1, sortOrder = 1) => {
  const books = await db.collection('books').find({
    inStock: true,
    publishedDate: { $gt: new Date('2010-01-01') }
  })
  .project({ title: 1, author: 1, price: 1 })
  .sort({ price: sortOrder })
  .skip((page - 1) * 5)
  .limit(5)
  .toArray();

  return books;
};

//  Task 2: Aggregation Pipeline
// - Create an aggregation pipeline to calculate the average price of books by genre
// - Create an aggregation pipeline to find the author with the most books in the collection
// - Implement a pipeline that groups books by publication decade and counts them
const aggregateBookData = async (db) => {
  // Average price of books by genre
  const avgPriceByGenre = await db.collection('books').aggregate([
    { $group: { _id: "$genre", averagePrice: { $avg: "$price" } } }
  ]).toArray();

  // Author with the most books
  const mostProlificAuthor = await db.collection('books').aggregate([
    { $group: { _id: "$author", bookCount: { $sum: 1 } } },
    { $sort: { bookCount: -1 } },
    { $limit: 1 }
  ]).toArray();

  // Books by publication decade
  const booksByDecade = await db.collection('books').aggregate([
    { $group: { _id: { $substr: ["$publishedDate", 0, 3] }, count: { $sum: 1 } } }
  ]).toArray();

  return {
    avgPriceByGenre,
    mostProlificAuthor,
    booksByDecade
  };
};

// ### Task 5: Indexing
// - Create an index on the `title` field for faster searches
// - Create a compound index on `author` and `published_year`
// - Use the `explain()` method to demonstrate the performance improvement with your indexes
const createIndexes = async (db) => {
  // Create an index on the title field
  await db.collection('books').createIndex({ title: 1 });
  
  // Create a compound index on author and published_year
  await db.collection('books').createIndex({ author: 1, published_year: 1 });

  // Use explain to show the performance of a query using the index
  const explainResult = await db.collection('books').find({ title: "1984" }).explain();
  
  return explainResult;
};

module.exports = {
  findBooks,
  aggregateBookData,
  createIndexes
};