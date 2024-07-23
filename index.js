const bookIdFilter = document.querySelector('#input-search-id');
const bookGenreFilter = document.querySelector('#input-search-genre');
const priceMinFilter = document.querySelector('#input-search-price-min');
const priceMaxFilter = document.querySelector('#input-search-price-max');
const bookAuthorFilter = document.querySelector('#input-search-author');
const yearFilter = document.querySelector('#input-search-year');
const searchBtn = document.querySelector('#btn-search');
const tableBody = document.querySelector('#table-similar-books tbody');

const url =
  'https://assignment-test-data-101.s3.ap-south-1.amazonaws.com/books.json';
let data = [];

const filterData = (val, filterType, currentData) => {
  if (filterType === 'bookId') {
    currentData = currentData.filter((book) => book.bookId === val);
  }
  if (filterType === 'genre') {
    currentData = currentData.filter((book) =>
      book.genre.toLowerCase().includes(val.toLowerCase())
    );
  }
  if (filterType === 'priceMin') {
    currentData = currentData.filter((book) => book.price >= val);
  }
  if (filterType === 'priceMax') {
    currentData = currentData.filter((book) => book.price <= val);
  }
  if (filterType === 'author') {
    currentData = currentData.filter((book) =>
      book.author.toLowerCase().includes(val.toLowerCase())
    );
  }
  if (filterType === 'publicationYear') {
    currentData = currentData.filter(
      (book) => book.publicationYear.toString() === val
    );
  }
  console.log('Filtered Examined Books :- ');
  console.log(currentData);
  return currentData;
};




const renderAllBooks = () => {
  const allBooksTable = document.querySelector('#table-all-books tbody');
  allBooksTable.innerHTML = '';
  for (let i = 0; i < data.length; i++) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
    <td>${data[i].bookId}</td>
    <td>${data[i].genre}</td>
    <td>${data[i].price}</td>
    <td>${data[i].author}</td>
    <td>${data[i].publicationYear}</td>`;
    allBooksTable.appendChild(newRow);
  }
};

const renderSimilarBooks = (currentBook) => {
  const similarBooks = data.filter((book) => {
    const isSameGenre =
      book.genre.toLowerCase() === currentBook.genre.toLowerCase();
    const isInPriceRange =
      book.price >= currentBook.price * 0.9 &&
      book.price <= currentBook.price * 1.1;
    return (
      book.bookId !== currentBook.bookId && (isSameGenre || isInPriceRange)
    );
  });
  console.log('All Similar Books :- ');
  console.log(similarBooks);
  tableBody.innerHTML = '';
  let temp = 0;
  for (let i = 0; temp < 5 && i < similarBooks.length; i++) {
    const rowEntry = document.createElement('tr');
    rowEntry.innerHTML = `
    <td>${similarBooks[i].bookId}</td>
    <td>${similarBooks[i].genre}</td>
    <td>${similarBooks[i].price}</td>
    <td>${similarBooks[i].author}</td>
    <td>${similarBooks[i].publicationYear}</td>`;
    temp++;
    tableBody.appendChild(rowEntry);
  }
  renderAllBooks();
};

const renderSearchedBookDetails = (filteredData) => {
  const examinedBookId = document.querySelector('#book-id');
  const examinedPrice = document.querySelector('#book-price');
  const examinedGenre = document.querySelector('#book-genre');
  const examinedAuthor = document.querySelector('#book-author');
  const examinedPublicationYear = document.querySelector('#book-year');

  if (filteredData.length === 0) {
    examinedBookId.innerHTML = '<b>No Record Found</b>';
    examinedPrice.innerHTML = '<b>No Record Found</b>';
    examinedGenre.innerHTML = '<b>No Record Found</b>';
    examinedAuthor.innerHTML = '<b>No Record Found</b>';
    examinedPublicationYear.innerHTML = '<b>No Record Found</b>';
  } else {
    examinedBookId.innerHTML = `<b>${filteredData[0].bookId}</b>`;
    examinedPrice.innerHTML = `<b>${filteredData[0].price}</b>`;
    examinedGenre.innerHTML = `<b>${filteredData[0].genre}</b>`;
    examinedAuthor.innerHTML = `<b>${filteredData[0].author}</b>`;
    examinedPublicationYear.innerHTML = `<b>${filteredData[0].publicationYear}</b>`;
  }
  renderSimilarBooks(filteredData[0]);
};

async function getBooksData(event) {
  event.preventDefault();
  tableBody.innerHTML = '<b>No Similar Books</b>';
  try {
    const rawData = await fetch(url);
    const allBookData = await rawData.json();
    data = allBookData;
    console.log('All Books :- ');
    console.log(allBookData);
    let filteredData = data;
    if (bookIdFilter.value) {
      filteredData = filterData(bookIdFilter.value, 'bookId', filteredData);
    }
    if (bookGenreFilter.value) {
      filteredData = filterData(bookGenreFilter.value, 'genre', filteredData);
    }
    if (priceMinFilter.value) {
      filteredData = filterData(priceMinFilter.value, 'priceMin', filteredData);
    }
    if (priceMaxFilter.value) {
      filteredData = filterData(priceMaxFilter.value, 'priceMax', filteredData);
    }
    if (bookAuthorFilter.value) {
      filteredData = filterData(bookAuthorFilter.value, 'author', filteredData);
    }
    if (yearFilter.value) {
      filteredData = filterData(
        yearFilter.value,
        'publicationYear',
        filteredData
      );
    }
    renderSearchedBookDetails(filteredData);
  } catch (err) {
    console.error('Error in Fetching Book Data');
  }
}

searchBtn.addEventListener('click', getBooksData);
