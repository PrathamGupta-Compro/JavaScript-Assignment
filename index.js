const bookNameFilter = document.querySelector('#input-search-name');
const bookGenreFilter = document.querySelector('#input-search-genre');
const priceMinFilter = document.querySelector('#input-search-price-min');
const priceMaxFilter = document.querySelector('#input-search-price-max');
const bookAuthorFilter = document.querySelector('#input-search-author');
const yearFilter = document.querySelector('#input-search-year');
const searchBtn = document.querySelector('#btn-search');
const tableBody = document.querySelector('#table-similar-books tbody');
const tableth = document.querySelector('table th');
const similarBookContainer = document.querySelector('.similar-book-container');
const defaultImage = './product-not-found.png';
const similarBookCount = document.querySelector('#similar-book-count');

const url =
  'https://assignment-test-data-101.s3.ap-south-1.amazonaws.com/books-v2.json';
let data = [];

let currentPage = 1;
const rowsPerPage = 10;

const paginateData = (data, page, rowsPerPage) => {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return data.slice(start, end);
};

/**
 * Sorts HTML Table
 * @param {HTMLTableElement} table
 * @param {number} col
 * @param {boolean} asc
 */

const sortTableCol = (table, col, asc = true) => {
  const dirModifier = asc ? 1 : -1;
  const tBody = table.tBodies[0];
  const rows = Array.from(tBody.querySelectorAll('tr'));

  const sortedRows = rows.sort((a, b) => {
    const aColText = a
      .querySelector(`td:nth-child(${col + 1})`)
      .textContent.trim();
    const bColText = b
      .querySelector(`td:nth-child(${col + 1})`)
      .textContent.trim();

    //To compare just the values, we need to remove '$'
    const aValue = parseFloat(aColText.replace('$', ''));
    const bValue = parseFloat(bColText.replace('$', ''));

    return aValue > bValue ? 1 * dirModifier : -1 * dirModifier;
  });

  // Remove all existing tr from table
  while (tBody.firstChild) {
    tBody.removeChild(tBody.firstChild);
  }
  tBody.append(...sortedRows);

  table
    .querySelectorAll('th')
    .forEach((th) => th.classList.remove('th-sort-asc', 'th-sort-desc'));
  const temp =  table.querySelector(`th:nth-child(${col + 1})`);
  console.log("Temp - ", temp);
  table
    .querySelector(`th:nth-child(${col + 1})`)
    .classList.toggle('th-sort-asc', asc);
  table
    .querySelector(`th:nth-child(${col + 1})`)
    .classList.toggle('th-sort-desc', !asc);
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
      currentPage = page;
      renderAllBooks();
      savePageState(); // Calling the Fn to save the current page state.
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
    currentData = currentData.filter((book) => 
      book.bookName.toLowerCase().includes(val.toLowerCase()));
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

//Here We Want to render Similar Books, firstly on the basis of the same genre and then on the basis of ascending order of price.
//RULE: We want to display similar books with same genre and similarPrice Range in sorted Order, then the rest.
const renderSimilarBooks = (currentBook) => {
  const similarGenreBooks = data.filter((book) => {
    return (
      book.bookId !== currentBook.bookId &&
      book.genre.toLowerCase() === currentBook.genre.toLowerCase()
    );
  });
  const similarPricedBooks = data.filter((book) => {
    return (
      book.bookId !== currentBook.bookId &&
      book.price >= currentBook.price * 0.9 &&
      book.price <= currentBook.price * 1.1
    );
  });

  //Remove Duplicates
  const similarBooks = new Map();

  similarGenreBooks.forEach((book) => {
    similarBooks.set(book.bookId, book);
  });

  similarPricedBooks.forEach((book) => {
    if (!similarBooks.has(book.bookId)) {
      similarBooks.set(book.bookId, book);
    }
  });

  const finalBookList = Array.from(similarBooks.values());
  // similarBooks.sort((a,b) => a.price - b.price);
  console.log('All Similar Books :- ');
  console.log(finalBookList);
  tableBody.innerHTML = ''; //We did this so that, Before adding new row, old row data is cleared out and no duplicate entries are shown.
  let temp = 0;
  for (let i = 0; temp < 10 && i < finalBookList.length; i++) {
    const coverImage = finalBookList[i].coverImage ? finalBookList[i].coverImage : defaultImage;
    const rowEntry = document.createElement('tr');
    rowEntry.innerHTML = `
    <td><img src="${coverImage}" alt="${finalBookList[i].bookName}" style="width:50px;height:50px; object-fit:"contain"></td>
    <td>${finalBookList[i].bookName}</td>
    <td>${finalBookList[i].genre}</td>
    <td>$ ${finalBookList[i].price}</td>
    <td>${finalBookList[i].author}</td>
    <td>${finalBookList[i].publicationYear}</td>`;
    temp++;
    tableBody.appendChild(rowEntry);
  }
  similarBookCount.innerHTML = `Showing <b>${temp}</b> of <b>${finalBookList.length}</b> Similar Book(s)`;
  renderAllBooks();
};

const renderSearchedBookDetails = (filteredData) => {
  const examinedBookName = document.querySelector('#book-name');
  // const examinedBookId = document.querySelector('#book-id');
  const examinedPrice = document.querySelector('#book-price');
  const examinedGenre = document.querySelector('#book-genre');
  const examinedAuthor = document.querySelector('#book-author');
  const examinedImage = document.querySelector('#book-image');
  const examinedPublicationYear = document.querySelector('#book-year');
  if (filteredData.length === 0) {
    examinedBookName.innerHTML = '<b>No Record Found</b>'
    examinedPrice.innerHTML = '<b>No Record Found</b>';
    examinedGenre.innerHTML = '<b>No Record Found</b>';
    examinedAuthor.innerHTML = '<b>No Record Found</b>';
    examinedPublicationYear.innerHTML = '<b>No Record Found</b>';
    examinedImage.style.display = 'none';
  } else {
    if (!priceMinFilter.value && priceMaxFilter.value) {
      const len = filteredData.length;
      const coverImage = filteredData[len-1].coverImage ? filteredData[len-1].coverImage : defaultImage;
      examinedBookName.innerHTML = `<b>${filteredData[len-1].bookName}</b>`;
      examinedPrice.innerHTML = `<b>$ ${filteredData[len - 1].price}</b>`;
      examinedGenre.innerHTML = `<b>${filteredData[len - 1].genre}</b>`;
      examinedAuthor.innerHTML = `<b>${filteredData[len - 1].author}</b>`;
      examinedPublicationYear.innerHTML = `<b>${
        filteredData[len - 1].publicationYear
      }</b>`;
      examinedImage.src = coverImage;  // Set image source
      console.log(examinedImage.src);
      examinedImage.style.display = 'block';
    } else {
      const coverImage = filteredData[0].coverImage ? filteredData[0].coverImage : defaultImage;
      examinedBookName.innerHTML = `<b>${filteredData[0].bookName}</b>`;
      // examinedBookId.innerHTML = `<b>${filteredData[0].bookId}</b>`;
      examinedPrice.innerHTML = `<b>$ ${filteredData[0].price}</b>`;
      examinedGenre.innerHTML = `<b>${filteredData[0].genre}</b>`;
      examinedAuthor.innerHTML = `<b>${filteredData[0].author}</b>`;
      examinedPublicationYear.innerHTML = `<b>${filteredData[0].publicationYear}</b>`;
      examinedImage.src = coverImage;  // Set image source
      examinedImage.style.display = 'block';
      console.log(coverImage);
      console.log(examinedImage);
      console.log(examinedImage.src);
    }
    renderSimilarBooks(filteredData[0]);
  }
};

function getBooksDataPromises(event) {
  if (event) {
    event.preventDefault();
  }

  const localData = localStorage.getItem('bookData');
  let fetchedDataPromise;

  if (localData) {
    fetchedDataPromise = Promise.resolve(JSON.parse(localData));
  } else {
    fetchedDataPromise = fetch(url)
      .then((res) => res.json())
      .then((allBookData) => {
        localStorage.setItem('bookData', JSON.stringify(allBookData));
        return allBookData;
      })
      .catch((err) => {
        console.error('Error in Fetching Book Data', err);
        return [];
      });
  }

  fetchedDataPromise.then((allBookData) => {
    data = allBookData;

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
      filteredData = filterData(yearFilter.value, 'publicationYear', filteredData);
    }
    if (
      bookNameFilter.value ||
      bookGenreFilter.value ||
      priceMinFilter.value ||
      priceMaxFilter.value ||
      bookAuthorFilter.value ||
      yearFilter.value
    ) {
      filteredData.sort((a, b) => a.price - b.price);
      renderSearchedBookDetails(filteredData);
    }
    if (filteredData.length === 0) {
      similarBookContainer.style.display = 'none';
    }
    savePageState();
  });
}

async function getBooksData(event) {
  if(event){
    event.preventDefault();
  }
  // tableBody.innerHTML = '<b>No Similar Books</b>';
  const localData = localStorage.getItem('bookData');
  if(localData){
    console.log('Data fetched from local storage:');
    data = JSON.parse(localData);
  } else{
      try {
        const rawData = await fetch(url);
        const allBookData = await rawData.json();
        data = allBookData;
        localStorage.setItem('booksData', JSON.stringify(allBookData));
        console.log('Data fetched and stored in local storage:');
        console.log(allBookData);
      } catch (err) {
        console.error('Error in Fetching Book Data');
      }
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
        filteredData
      );
    }
    if (
      bookNameFilter.value ||
      bookGenreFilter.value ||
      priceMinFilter.value ||
      priceMaxFilter.value ||
      bookAuthorFilter.value ||
      yearFilter.value
    ) {
      filteredData.sort((a, b) => a.price - b.price);
      renderSearchedBookDetails(filteredData);
    }
    if(filteredData.length === 0){
      similarBookContainer.style.display = "none";
    }
    savePageState();
  } 
}

//THIS Fn saves the state of filter values and saves it in  local storage
function savePageState() {
  const filterState = {
    bookName: bookNameFilter.value,
    bookGenre: bookGenreFilter.value,
    priceMin: priceMinFilter.value,
    priceMax: priceMaxFilter.value,
    bookAuthor: bookAuthorFilter.value,
    year: yearFilter.value,
    currentPage: currentPage
  };
  localStorage.setItem(
    'filterState',
    JSON.stringify(filterState)
  );
}

function loadPageState() {
  const filterState = JSON.parse(localStorage.getItem('filterState'));
  if (filterState) {
    bookNameFilter.value = filterState.bookName;
    bookGenreFilter.value = filterState.bookGenre;
    priceMinFilter.value = filterState.priceMin;
    priceMaxFilter.value = filterState.priceMax;
    bookAuthorFilter.value = filterState.bookAuthor;
    yearFilter.value = filterState.year;
    currentPage = filterState.currentPage;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadPageState(); //Calls the loadPageState function when the page loads fully to checks if there is any saved state
  // getBooksData();
  getBooksDataPromises();
});

// searchBtn.addEventListener('click', getBooksData);
searchBtn.addEventListener('click', getBooksDataPromises);

document.querySelectorAll('.table-sortable th').forEach((headerCell) => {
  headerCell.addEventListener('click', () => {
    console.log("headerCell.parentElement.children");
    console.log(headerCell.parentElement.children);
    console.log("headerCell");
    console.log(headerCell);
    const tableElement = headerCell.closest('table');
    const headerIndex = Array.prototype.indexOf.call(
      headerCell.parentElement.children,
      headerCell
    );
    const currentIsAsc = headerCell.classList.contains('th-sort-asc');
    // Only sort if the column is Price (index 2) or Publication Year (index 4)
    if (headerIndex == 3 || headerIndex == 5) {
      sortTableCol(tableElement, headerIndex, !currentIsAsc);
    }
  });
});
