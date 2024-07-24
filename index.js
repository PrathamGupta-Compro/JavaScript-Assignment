const bookNameFilter = document.querySelector('#input-search-name');
const bookGenreFilter = document.querySelector('#input-search-genre');
const priceMinFilter = document.querySelector('#input-search-price-min');
const priceMaxFilter = document.querySelector('#input-search-price-max');
const bookAuthorFilter = document.querySelector('#input-search-author');
const yearFilter = document.querySelector('#input-search-year');
const searchBtn = document.querySelector('#btn-search');
const similarTableBody = document.querySelector('#table-similar-books tbody');
const allBooksTableBody = document.querySelector('#table-all-books tbody');
const tableth = document.querySelector('table th');
const similarBookContainer = document.querySelector('.similar-book-container');
const defaultImage = './product-not-found.png';
const similarBookCount = document.querySelector('#similar-book-count');
const upArrowSort = document.querySelector('.fa-arrow-up-short-wide');
const downArrowSort = document.querySelector('.fa-arrow-down-short-wide');

const url = 'https://assignment-test-data-101.s3.ap-south-1.amazonaws.com/books-v2.json';
let data = [];
let finalSimilarBookList = [];

let isAsc = true
let currentPage = 1;
const rowsPerPage = 10;



const paginateData = (data, page, rowsPerPage) => {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return data.slice(start, end);
};


const renderPagination = (totalPages) => {
  const paginationElement = document.querySelector('.pagination');
  paginationElement.innerHTML = '';

  const createPageItem = (page, text) => {
    const li = document.createElement('li');
    li.classList.add('page-item'); // For CSS new class page-item is added
    li.innerHTML = `<a class="page-link" href="#">${text}</a>`;
    if (page === currentPage) {
      li.classList.add('active');
    }
    li.addEventListener('click', (event) => {
      event.preventDefault();
      if(page >=1 && page <= totalPages) {
        currentPage = page;
        renderAllBooks();
      }
    });
    return li;
  };

  paginationElement.appendChild(createPageItem(currentPage - 1, 'Previous'));

  for (let i = 1; i <= totalPages; i++) {
    paginationElement.appendChild(createPageItem(i, i));
  }

  paginationElement.appendChild(createPageItem(currentPage + 1, 'Next'));
};

const renderAllBooks = () => {
  console.log('Called Render All Books :- ');
  const allBooksTable = document.querySelector('#table-all-books tbody');
  allBooksTable.innerHTML = '';

  const paginatedData = paginateData(data, currentPage, rowsPerPage);
  console.log('Pagination Data :- ');
  console.log(paginatedData);
  paginatedData.forEach((book) => {
    const coverImage = book.coverImage ? book.coverImage : defaultImage;
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td><img src="${coverImage}" alt="${book.bookName}" style="width:50px;height:50px; object-fit:"contain""></td>
      <td>${book.bookName}</td>
      <td>${book.genre}</td>
      <td>$ ${book.price}</td>
      <td>${book.author}</td>
      <td>${book.publicationYear}</td>`;
    allBooksTable.appendChild(newRow);
  });

  const totalPages = Math.ceil(data.length / rowsPerPage);
  renderPagination(totalPages);
};

const filterData = (val, filterType, currentData) => {
  if (filterType === 'bookName') {
    currentData = currentData.filter((book) => book.bookName.toLowerCase().includes(val.toLowerCase()));
  }
  if (filterType === 'genre') {
    currentData = currentData.filter((book) => book.genre.toLowerCase().includes(val.toLowerCase()));
  }
  if (filterType === 'priceMin') {
    currentData = currentData.filter((book) => book.price >= val);
  }
  if (filterType === 'priceMax') {
    currentData = currentData.filter((book) => book.price <= val);
  }
  if (filterType === 'author') {
    currentData = currentData.filter((book) => book.author.toLowerCase().includes(val.toLowerCase()));
  }
  if (filterType === 'publicationYear') {
    currentData = currentData.filter(
      (book) => book.publicationYear.toString() === val,
    );
  }
  console.log('Filtered Examined Books :- ');
  console.log(currentData);
  return currentData;
};

// Here We Want to render Similar Books, firstly on the basis of the same genre and then on the basis of ascending order of price.
// RULE: We want to display similar books with same genre and similarPrice Range in sorted Order, then the rest.
const renderSimilarBooks = (currentBook) => {
  
  const similarGenreAndPriceBooks = data.filter((book) => (
    book.bookId !== currentBook.bookId 
      && book.price >= currentBook.price * 0.9
      && book.price <= currentBook.price * 1.1
      && book.genre.toLowerCase() === currentBook.genre.toLowerCase()
  ));

  const similarGenreBooks = data.filter((book) => (
    book.bookId !== currentBook.bookId
      && book.genre.toLowerCase() === currentBook.genre.toLowerCase()
  ));
  const similarPricedBooks = data.filter((book) => (
    book.bookId !== currentBook.bookId
      && book.price >= currentBook.price * 0.9
      && book.price <= currentBook.price * 1.1
  ));

  // Remove Duplicates
  const similarBooks = new Map();

  similarGenreAndPriceBooks.forEach((book) => {
    similarBooks.set(book.bookId, book);
  });

  similarGenreBooks.forEach((book) => {
    if(!similarBooks.has(book.bookId)) {
      similarBooks.set(book.bookId, book);
    }
  });

  similarPricedBooks.forEach((book) => {
    if (!similarBooks.has(book.bookId)) {
      similarBooks.set(book.bookId, book);
    }
  });

  finalSimilarBookList = Array.from(similarBooks.values());
  // similarBooks.sort((a,b) => a.price - b.price);
  console.log('All Similar Books :- ');
  console.log(finalSimilarBookList);
  similarTableBody.innerHTML = ''; // We did this so that, Before adding new row, old row data is cleared out and no duplicate entries are shown.
  let temp = 0;
  for (let i = 0; temp < 10 && i < finalSimilarBookList.length; i++) {
    const coverImage = finalSimilarBookList[i].coverImage
      ? finalSimilarBookList[i].coverImage
      : defaultImage;
    const rowEntry = document.createElement('tr');
    rowEntry.innerHTML = `
    <td><img src="${coverImage}" alt="${finalSimilarBookList[i].bookName}" style="width:50px;height:50px; object-fit:"contain"></td>
    <td>${finalSimilarBookList[i].bookName}</td>
    <td>${finalSimilarBookList[i].genre}</td>
    <td>$ ${finalSimilarBookList[i].price}</td>
    <td>${finalSimilarBookList[i].author}</td>
    <td>${finalSimilarBookList[i].publicationYear}</td>`;
    temp++;
    similarTableBody.appendChild(rowEntry);
  }
  similarBookCount.innerHTML = `Showing <b>${temp}</b> of <b>${finalSimilarBookList.length}</b> Similar Book(s)`;
  renderAllBooks();
};

const renderSearchedBookDetails = (filteredData) => {
  const examinedBookName = document.querySelector('#book-name');
  const examinedPrice = document.querySelector('#book-price');
  const examinedGenre = document.querySelector('#book-genre');
  const examinedAuthor = document.querySelector('#book-author');
  const examinedImage = document.querySelector('#book-image');
  const examinedPublicationYear = document.querySelector('#book-year');

  if (filteredData.length === 0) {
    examinedBookName.innerHTML = '<b>No Record Found</b>';
    examinedPrice.innerHTML = '<b>No Record Found</b>';
    examinedGenre.innerHTML = '<b>No Record Found</b>';
    examinedAuthor.innerHTML = '<b>No Record Found</b>';
    examinedPublicationYear.innerHTML = '<b>No Record Found</b>';
    examinedImage.src = defaultImage;
    similarBookContainer.style.display = 'none';
  } else {
    similarBookContainer.style.display = 'block';
    let bookToExamine;
    if (!priceMinFilter.value && priceMaxFilter.value) {
      bookToExamine = filteredData[filteredData.length - 1];
    } else {
      bookToExamine = filteredData[0];
    }
    const coverImage = bookToExamine.coverImage
      ? bookToExamine.coverImage
      : defaultImage;
    examinedBookName.innerHTML = `<b>${bookToExamine.bookName}</b>`;;
    examinedPrice.innerHTML = `<b>$ ${bookToExamine.price}</b>`;
    examinedGenre.innerHTML = `<b>${bookToExamine.genre}</b>`;
    examinedAuthor.innerHTML = `<b>${bookToExamine.author}</b>`;
    examinedPublicationYear.innerHTML = `<b>${bookToExamine.publicationYear}</b>`;
    examinedImage.src = coverImage; // Set image source
    examinedImage.style.display = 'block';

    localStorage.setItem('examinedBook', JSON.stringify(bookToExamine));
    renderSimilarBooks(filteredData[0]);
  }
};


//API CALL THROUGH PROMISES
// function getBooksDataPromises(event) {
//   if (event) {
//     event.preventDefault();
//   }

//   const localData = localStorage.getItem('bookData');
//   let fetchedDataPromise;

//   if (localData) {
//     fetchedDataPromise = Promise.resolve(JSON.parse(localData));
//   } else {
//     fetchedDataPromise = fetch(url)
//       .then((res) => res.json())
//       .then((allBookData) => {
//         localStorage.setItem('bookData', JSON.stringify(allBookData));
//         return allBookData;
//       })
//       .catch((err) => {
//         console.error('Error in Fetching Book Data', err);
//         return [];
//       });
//   }

//   fetchedDataPromise.then((allBookData) => {
//     data = allBookData;

//     let filteredData = data;
//     if (bookNameFilter.value) {
//       filteredData = filterData(bookNameFilter.value, 'bookName', filteredData);
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
//     if (
//       bookNameFilter.value ||
//       bookGenreFilter.value ||
//       priceMinFilter.value ||
//       priceMaxFilter.value ||
//       bookAuthorFilter.value ||
//       yearFilter.value
//     ) {
//       filteredData.sort((a, b) => a.price - b.price);
//       similarBookContainer.style.display = 'block';
//       renderSearchedBookDetails(filteredData);
//     }
//     savePageState();
//   });
// }

// FUNCTION FOR API call to fetch data

// API CALL THROUGH ASYNC AWAIT
async function getBooksData() {
  console.log('In Get Book Data');
  const localData = localStorage.getItem('bookData');
  try {
    if (localData) {
      console.log('Data fetched from local storage:');
      data = JSON.parse(localData);
    } else {
      console.log('Fetching data from API...');
      const rawData = await fetch(url);
      const allBookData = await rawData.json();
      data = allBookData;
      localStorage.setItem('bookData', JSON.stringify(allBookData));
      console.log('Data fetched and stored in local storage:');
      console.log(allBookData);
    }
  } catch (err) {
    console.error('Error in Fetching Book Data');
    console.error(err);
  }
}

// THIS Fn saves the state of filter values and saves it in  local storage
const savePageState = () => {
  const filterState = {
    bookName: bookNameFilter.value,
    bookGenre: bookGenreFilter.value,
    priceMin: priceMinFilter.value,
    priceMax: priceMaxFilter.value,
    bookAuthor: bookAuthorFilter.value,
    year: yearFilter.value,
  };
  localStorage.setItem('filterState', JSON.stringify(filterState));
}

const loadPageState = () => {
  console.log('In loadPageState');
  const filterState = JSON.parse(localStorage.getItem('filterState'));
  if (filterState) {
    bookNameFilter.value = filterState.bookName;
    bookGenreFilter.value = filterState.bookGenre;
    priceMinFilter.value = filterState.priceMin;
    priceMaxFilter.value = filterState.priceMax;
    bookAuthorFilter.value = filterState.bookAuthor;
    yearFilter.value = filterState.year;
  }
}

const handleSort = (valType,tableType) => {
  console.log(valType);
  console.log(tableType);
  if(tableType === 'similar-books-table'){
    console.log('In If of Similar  Books');;
    console.log(finalSimilarBookList);
    similarTableBody.innerHTML = '';
    if (valType === 'price') {
      finalSimilarBookList.sort((a, b) => isAsc ? a.price - b.price : b.price - a.price);
    } else if (valType === 'year') {
      finalSimilarBookList.sort((a, b) => isAsc ? a.publicationYear - b.publicationYear : b.publicationYear - a.publicationYear);
    }
    isAsc = !isAsc;
    for (let i = 0; i < finalSimilarBookList.length; i++) {
      const coverImage = finalSimilarBookList[i].coverImage || defaultImage;
      const rowEntry = document.createElement('tr');
      rowEntry.innerHTML = `
        <td><img src="${coverImage}" alt="${finalSimilarBookList[i].bookName}" style="width:50px;height:50px;object-fit:contain"></td>
        <td>${finalSimilarBookList[i].bookName}</td>
        <td>${finalSimilarBookList[i].genre}</td>
        <td>$ ${finalSimilarBookList[i].price}</td>
        <td>${finalSimilarBookList[i].author}</td>
        <td>${finalSimilarBookList[i].publicationYear}</td>`;
      similarTableBody.appendChild(rowEntry);
    }
  }else if (tableType === 'all-books-table'){
    allBooksTableBody.innerHTML = '';
    if(valType === 'price'){
      data.sort((a, b) => isAsc ? a.price - b.price : b.price - a.price);
    }else if(valType === 'year'){
      data.sort((a, b) => isAsc ? a.publicationYear - b.publicationYear : b.publicationYear - a.publicationYear);
    }
    isAsc = !isAsc;
    renderAllBooks();
  }

}

const handleSearch = () => {
  let filteredData = data;
  if (bookNameFilter.value) {
    filteredData = filterData(bookNameFilter.value, 'bookName', filteredData);
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
      filteredData,
    );
  }
  if (
    bookNameFilter.value
    || bookGenreFilter.value
    || priceMinFilter.value
    || priceMaxFilter.value
    || bookAuthorFilter.value
    || yearFilter.value
  ) {
    filteredData.sort((a, b) => a.price - b.price);
    similarBookContainer.style.display = 'block';
    renderSearchedBookDetails(filteredData);
  } else {
    renderSearchedBookDetails([]);
  }
  savePageState();
};

const initialize = async () => {
  loadPageState();
  await getBooksData();
  const examinedBook = JSON.parse(localStorage.getItem('examinedBook'));
  if (examinedBook) {
    renderSearchedBookDetails([examinedBook]);
  }
  renderAllBooks();
};
initialize();



// aJ24-8Ufb