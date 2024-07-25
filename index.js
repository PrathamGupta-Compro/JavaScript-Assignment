const bookNameFilter = document.querySelector('#input-search-name');
const bookGenreFilter = document.querySelector('#input-search-genre');
const priceMinFilter = document.querySelector('#input-search-price-min');
const priceMaxFilter = document.querySelector('#input-search-price-max');
const bookAuthorFilter = document.querySelector('#input-search-author');
const yearFilter = document.querySelector('#input-search-year');
const similarTableBody = document.querySelector('#table-similar-books tbody');
const allBooksTableBody = document.querySelector('#table-all-books tbody');
const similarBookContainer = document.querySelector('.similar-book-container');
const defaultImage = './product-not-found.png';
const similarBookCount = document.querySelector('#similar-book-count');

const url = 'https://assignment-test-data-101.s3.ap-south-1.amazonaws.com/books-v2.json';
let data = [];
let finalSimilarBookList = [];

let isAsc = true;
let currentPage = 1;
const rowsPerPage = 10;

const paginateData = (page) => {
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
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderAllBooks();
      }
    });
    return li;
  };

  paginationElement.appendChild(createPageItem(currentPage - 1, 'Previous'));

  for (let i = 1; i <= totalPages; i += 1) {
    paginationElement.appendChild(createPageItem(i, i));
  }

  paginationElement.appendChild(createPageItem(currentPage + 1, 'Next'));
};

const renderAllBooks = () => {
  const allBooksTable = document.querySelector('#table-all-books tbody');
  allBooksTable.innerHTML = '';

  const paginatedData = paginateData(currentPage);
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
  switch (filterType) {
    case 'bookName':
      return currentData.filter((book) => book.bookName.toLowerCase().includes(val.toLowerCase()));
    case 'genre':
      return currentData.filter((book) => book.genre.toLowerCase().includes(val.toLowerCase()));
    case 'priceMin':
      return currentData.filter((book) => book.price >= val);
    case 'priceMax':
      return currentData.filter((book) => book.price <= val);
    case 'author':
      return currentData.filter((book) => book.author.toLowerCase().includes(val.toLowerCase()));
    case 'publicationYear':
      return currentData.filter(
        (book) => book.publicationYear.toString() === val,
      );
    default:
      return currentData;
  }
};

const renderSimilarBooks = (currentBook) => {
  const similarGenreAndPriceBooks = data.filter(
    (book) => book.bookId !== currentBook.bookId
      && book.price >= currentBook.price * 0.9
      && book.price <= currentBook.price * 1.1
      && book.genre.toLowerCase() === currentBook.genre.toLowerCase(),
  );

  const similarGenreBooks = data.filter(
    (book) => book.bookId !== currentBook.bookId
      && book.genre.toLowerCase() === currentBook.genre.toLowerCase(),
  );
  const similarPricedBooks = data.filter(
    (book) => book.bookId !== currentBook.bookId
      && book.price >= currentBook.price * 0.9
      && book.price <= currentBook.price * 1.1,
  );

  // Remove Duplicates
  const similarBooks = new Map();

  similarGenreAndPriceBooks.forEach((book) => {
    similarBooks.set(book.bookId, book);
  });

  similarGenreBooks.forEach((book) => {
    if (!similarBooks.has(book.bookId)) {
      similarBooks.set(book.bookId, book);
    }
  });

  similarPricedBooks.forEach((book) => {
    if (!similarBooks.has(book.bookId)) {
      similarBooks.set(book.bookId, book);
    }
  });

  finalSimilarBookList = Array.from(similarBooks.values());
  similarTableBody.innerHTML = ''; // Clear old rows to avoid duplicates
  finalSimilarBookList.slice(0, 10).forEach((book) => {
    const coverImage = book.coverImage || defaultImage;
    const rowEntry = document.createElement('tr');
    rowEntry.innerHTML = `
      <td><img src="${coverImage}" alt="${book.bookName}" style="width:50px;height:50px; object-fit:contain;"></td>
      <td>${book.bookName}</td>
      <td>${book.genre}</td>
      <td>$ ${book.price}</td>
      <td>${book.author}</td>
      <td>${book.publicationYear}</td>`;
    similarTableBody.appendChild(rowEntry);
  });
  similarBookCount.innerHTML = `Showing <b>${Math.min(
    10,
    finalSimilarBookList.length,
  )}</b> of <b>${finalSimilarBookList.length}</b> Similar Book(s)`;
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
    examinedBookName.innerHTML = `<b>${bookToExamine.bookName}</b>`;
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

// API CALL THROUGH PROMISES
function getBooksDataPromises() {
  const localData = localStorage.getItem('bookData');
  if (localData) {
    data = JSON.parse(localData);
    return Promise.resolve(data);
  }
  return fetch(url)
    .then((res) => res.json())
    .then((allBookData) => {
      localStorage.setItem('bookData', JSON.stringify(allBookData));
      data = allBookData;
      return allBookData;
    })
    .catch((err) => {
      console.error('Error in Fetching Book Data', err);
      data = [];
      return data;
    });
}

// API CALL THROUGH ASYNC AWAIT
// eslint-disable-next-line no-unused-vars
async function getBooksData() {
  const localData = localStorage.getItem('bookData');
  try {
    if (localData) {
      data = JSON.parse(localData);
    } else {
      const rawData = await fetch(url);
      const allBookData = await rawData.json();
      data = allBookData;
      localStorage.setItem('bookData', JSON.stringify(allBookData));
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
};

const loadPageState = () => {
  const filterState = JSON.parse(localStorage.getItem('filterState'));
  if (filterState) {
    bookNameFilter.value = filterState.bookName;
    bookGenreFilter.value = filterState.bookGenre;
    priceMinFilter.value = filterState.priceMin;
    priceMaxFilter.value = filterState.priceMax;
    bookAuthorFilter.value = filterState.bookAuthor;
    yearFilter.value = filterState.year;
  }
};

// eslint-disable-next-line no-unused-vars
const handleSort = (valType, tableType) => {
  if (tableType === 'similar-books-table') {
    similarTableBody.innerHTML = '';
    if (valType === 'price') {
      finalSimilarBookList.sort((a, b) => (isAsc ? a.price - b.price : b.price - a.price));
    } else if (valType === 'year') {
      finalSimilarBookList.sort((a, b) => (isAsc
        ? a.publicationYear - b.publicationYear
        : b.publicationYear - a.publicationYear));
    }
    isAsc = !isAsc;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < finalSimilarBookList.length && i < 10; i++) {
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
  } else if (tableType === 'all-books-table') {
    allBooksTableBody.innerHTML = '';
    if (valType === 'price') {
      data.sort((a, b) => (isAsc ? a.price - b.price : b.price - a.price));
    } else if (valType === 'year') {
      data.sort((a, b) => (isAsc
        ? a.publicationYear - b.publicationYear
        : b.publicationYear - a.publicationYear));
    }
    isAsc = !isAsc;
    renderAllBooks();
  }
};

// eslint-disable-next-line no-unused-vars
const handleSearch = () => {
  let filteredData = data;
  const filters = [
    { value: bookNameFilter.value, type: 'bookName' },
    { value: bookGenreFilter.value, type: 'genre' },
    { value: priceMinFilter.value, type: 'priceMin' },
    { value: priceMaxFilter.value, type: 'priceMax' },
    { value: bookAuthorFilter.value, type: 'author' },
    { value: yearFilter.value, type: 'publicationYear' },
  ];

  filters.forEach((filter) => {
    if (filter.value) {
      filteredData = filterData(filter.value, filter.type, filteredData);
    }
  });

  if (filters.some((filter) => filter.value)) {
    filteredData.sort((a, b) => a.price - b.price);
    similarBookContainer.style.display = 'block';
    renderSearchedBookDetails(filteredData);
  } else {
    renderSearchedBookDetails([]);
  }

  savePageState();
};

const handleExaminedBookANdRender = () => {
  const examinedBook = JSON.parse(localStorage.getItem('examinedBook'));
  if (examinedBook) {
    renderSearchedBookDetails([examinedBook]);
  }
  renderAllBooks();
};

const initialize = async () => {
  loadPageState();
  // await getBooksData();
  // handleExaminedBookANdRender();
  getBooksDataPromises().then(handleExaminedBookANdRender);
};
initialize();
