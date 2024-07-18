const bookIdFilter = document.querySelector('#input-search-id');
const bookGenreFilter = document.querySelector('#input-search-genre');
const priceMinFilter = document.querySelector('#input-search-price-min');
const priceMaxFilter = document.querySelector('#input-search-price-max');
const bookAuthorFilter = document.querySelector('#input-search-author');
const yearFilter = document.querySelector('#input-search-year');
const searchBtn = document.querySelector('#btn-search');

const url = 'https://assignment-test-data-101.s3.ap-south-1.amazonaws.com/books.json';
let data = [];

function filterData(val, filterType, currentData) {
  if (filterType === 'bookId') {
    currentData = currentData.filter((book) => book.bookId === val);
  }
  if (filterType === 'genre') {
    currentData = currentData.filter((book) => book.genre === val);
  }
  if (filterType === 'priceMin') {
    currentData = currentData.filter((book) => book.price >= val);
  }
  if (filterType === 'priceMax') {
    currentData = currentData.filter((book) => book.price <= val);
  }
  if (filterType === 'author') {
    currentData = currentData.filter((book) => book.author === val);
  }
  if (filterType === 'publicationYear') {
    currentData = currentData.filter((book) => book.publicationYear === val);
  }
  console.log(currentData);
  return currentData;
}

async function getBooksData(event) {
  event.preventDefault();
  try {
    const rawData = await fetch(url);
    const allBookData = await rawData.json();
    data = allBookData;
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
      filteredData = filterData(yearFilter.value, 'publicationYear', filteredData);
    }
    renderSearchedBookDetails(filteredData);
  } catch (err) {
    console.error('Error in Fetching Book Data');
  }
}

function renderSearchedBookDetails(filteredData) {

}
searchBtn.addEventListener('click', getBooksData);

// function filterData(val, filterType, currentData) {
//   if (filterType === 'bookId') {
//     return currentData.filter(book => book.bookId === val);
//   }
//   if (filterType === 'genre') {
//     return currentData.filter(book => book.genre.toLowerCase().includes(val.toLowerCase()));
//   }
//   if (filterType === 'priceMin') {
//     return currentData.filter(book => book.price >= parseFloat(val));
//   }
//   if (filterType === 'priceMax') {
//     return currentData.filter(book => book.price <= parseFloat(val));
//   }
//   if (filterType === 'author') {
//     return currentData.filter(book => book.author.toLowerCase().includes(val.toLowerCase()));
//   }
//   if (filterType === 'publicationYear') {
//     return currentData.filter(book => book.publicationYear == val);
//   }
//   return currentData;
// }

// async function getBooksData(event) {
//   event.preventDefault();
//   try {
//     const rawData = await fetch(url);
//     const allBookData = await rawData.json();
//     data = allBookData;
//     console.log(allBookData);
//     let filteredData = data;
//     if (bookIdFilter.value) {
//       filteredData = filterData(bookIdFilter.value, 'bookId', filteredData);
//     }
//     if (bookGenreFilter.value) {
//       filteredData = filterData(bookGenreFilter.value, 'genre', filteredData);
//     }
//     if (priceMinFilter.value) {
//       filteredData = filterData(priceMinFilter.value, 'priceMin', filteredData);
//     }
//     if (priceMaxFilter.value) {
//       filteredData = filterData(priceMaxFilter.value, 'priceMax', filteredData);
//     }
//     if (bookAuthorFilter.value) {
//       filteredData = filterData(bookAuthorFilter.value, 'author', filteredData);
//     }
//     if (yearFilter.value) {
//       filteredData = filterData(yearFilter.value, 'publicationYear', filteredData);
//     }
//     console.log('Filtered Data', filteredData);
//     renderSearchedBookDetails(filteredData); // Call the render function with the filtered data
//   } catch (err) {
//     console.error('Error in Fetching Book Data:', err);
//   }
// }
