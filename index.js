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

/**
 * Paginates the data array for the specified page.
 *
 * @param {number} page - The page number to retrieve data for.
 * @returns {Object[]} - A subset of the data array corresponding to the specified page.
 */
const paginateData = (page) => {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return data.slice(start, end);
};

/**
 * Renders pagination controls based on the total number of pages.
 *
 * @param {number} totalPages - The total number of pages for pagination.
 * @returns {void}
 */
const renderPagination = (totalPages) => {
  const paginationElement = document.querySelector('.pagination');
  paginationElement.innerHTML = '';

  /**
   * Creates a pagination item (page button) element.
   *
   * @param {number} page - The page number associated with this pagination item.
   * @param {string} text - The text to display for this pagination item.
   * @returns {HTMLLIElement} - The created pagination item as an <li> element.
   */
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

  // Add Previous button
  paginationElement.appendChild(createPageItem(currentPage - 1, 'Previous'));

  // Add page number buttons
  for (let i = 1; i <= totalPages; i += 1) {
    paginationElement.appendChild(createPageItem(i, i));
  }

  // Add Next button
  paginationElement.appendChild(createPageItem(currentPage + 1, 'Next'));
};

/**
 * Renders the list of books in a table and updates pagination controls.
 *
 * This function fetches the books data for the current page, creates table rows for each book,
 * and appends them to the table body. It also calculates the total number of pages and renders
 * pagination controls based on that.
 *
 * @returns {void}
 */
const renderAllBooks = () => {
  const allBooksTable = document.querySelector('#table-all-books tbody');
  allBooksTable.innerHTML = '';

  // Get paginated data for the current page
  const paginatedData = paginateData(currentPage);

  // Create and append table rows for each book
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

  // Calculate total pages and render pagination controls
  const totalPages = Math.ceil(data.length / rowsPerPage);
  renderPagination(totalPages);
};

/**
 * Filters the list of books based on a specified filter type and value.
 *
 * @param {string|number} val - The value to filter by. It can be a string for textual filters
 *                               or a number for price filters.
 * @param {string} filterType - The type of filter to apply. Possible values include:
*                               'bookName', 'genre', 'priceMin', 'priceMax',
*                               'author', or 'publicationYear'.
 * @param {Array<Object>} currentData - The array of book objects to be filtered.
*                                      Each book object should have
*                                      properties corresponding to the filter types.
*
* @returns {Array<Object>} - A new array of book objects that match the filter criteria. */
const filterData = (val, filterType, currentData) => {
  switch (filterType) {
    case 'bookName': {
      const bookNameExactMatches = currentData.filter(
        (book) => book.bookName.toLowerCase() === val.toLowerCase(),
      );
      if (bookNameExactMatches.length > 0) {
        return bookNameExactMatches;
      }
      const startsWithMatches = currentData.filter(
        (book) => book.bookName.toLowerCase().startsWith(val.toLowerCase()),
      );
      if (startsWithMatches.length > 0) {
        return startsWithMatches;
      }
      return currentData.filter(
        (book) => book.bookName.toLowerCase().includes(val.toLowerCase()),
      );
    }
    case 'genre': {
      const lowerVal = val.toLowerCase();
      const genreExactMatches = currentData.filter(
        (book) => book.genre.toLowerCase() === lowerVal,
      );
      if (genreExactMatches.length > 0) {
        return genreExactMatches;
      }
      const genreStartsWithMatches = currentData.filter(
        (book) => book.genre.toLowerCase().startsWith(lowerVal),
      );
      if (genreStartsWithMatches.length > 0) {
        return genreStartsWithMatches;
      }
      return currentData.filter(
        (book) => book.genre.toLowerCase().includes(lowerVal),
      );
    }
    case 'priceMin':
      return currentData.filter((book) => book.price >= val);
    case 'priceMax':
      return currentData.filter((book) => book.price <= val);
    case 'author': {
      const lowerVal = val.toLowerCase();
      const authorExactMatches = currentData.filter(
        (book) => book.author.toLowerCase() === lowerVal,
      );
      if (authorExactMatches.length > 0) {
        return authorExactMatches;
      }
      const authorStartsWithMatches = currentData.filter(
        (book) => book.author.toLowerCase().startsWith(lowerVal),
      );
      if (authorStartsWithMatches.length > 0) {
        return authorStartsWithMatches;
      }
      return currentData.filter(
        (book) => book.author.toLowerCase().includes(lowerVal),
      );
    }
    case 'publicationYear':
      return currentData.filter(
        (book) => book.publicationYear.toString() === val,
      );
    default:
      return currentData;
  }
};

/**
 * Renders a list of books similar to the provided current book based on genre and price.
 * Updates the DOM to display these similar books and shows the count of similar books.
 *
/**
  * @param {Object} currentBook - The book object to find similar books for.
  *                               It should have the following properties:
  *                                - bookId {string|number} - Unique identifier for the book.
 *                                - price {number} - Price of the book.
 *                                - genre {string} - Genre of the book.
 * @returns {void} - This function does not return a value. */
const renderSimilarBooks = (currentBook) => {
  // Filter books based on genre and price range
  const similarGenreAndPriceBooks = data.filter(
    (book) => book.bookId !== currentBook.bookId
      && book.price >= currentBook.price * 0.9
      && book.price <= currentBook.price * 1.1
      && book.genre.toLowerCase() === currentBook.genre.toLowerCase(),
  );

  // Filter books based on genre only
  const similarGenreBooks = data.filter(
    (book) => book.bookId !== currentBook.bookId
      && book.genre.toLowerCase() === currentBook.genre.toLowerCase(),
  );

  // Filter books based on price range only
  const similarPricedBooks = data.filter(
    (book) => book.bookId !== currentBook.bookId
      && book.price >= currentBook.price * 0.9
      && book.price <= currentBook.price * 1.1,
  );

  similarGenreAndPriceBooks.sort((a, b) => a.price - b.price);
  similarGenreBooks.sort((a, b) => a.price - b.price);
  similarPricedBooks.sort((a, b) => a.price - b.price);
  // Combine and remove duplicate books
  const combinedBooks = [
    ...similarGenreAndPriceBooks,
    ...similarGenreBooks.filter(
      (book) => !similarGenreAndPriceBooks.some((b) => b.bookId === book.bookId),
    ),
    ...similarPricedBooks.filter((book) =>
      // eslint-disable-next-line implicit-arrow-linebreak
      !similarGenreAndPriceBooks.some((b) => b.bookId === book.bookId)
      && !similarGenreBooks.some((b) => b.bookId === book.bookId)),
  ];

  // Remove duplicates while maintaining order
  const uniqueBooksMap = new Map();
  combinedBooks.forEach((book) => {
    if (!uniqueBooksMap.has(book.bookId)) {
      uniqueBooksMap.set(book.bookId, book);
    }
  });

  // Convert Map to array and limit to 10 books for display
  finalSimilarBookList = Array.from(uniqueBooksMap.values());
  console.log('FInal Similar Book List:');
  console.log(finalSimilarBookList);

  // Clear previous similar books
  similarTableBody.innerHTML = '';

  // Clear previous similar books
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

  // Update the similar book count display
  similarBookCount.innerHTML = `Showing <b>${Math.min(
    10,
    finalSimilarBookList.length,
  )}</b> of <b>${finalSimilarBookList.length}</b> Similar Book(s)`;

  // Render all books to update the display
  renderAllBooks();
};

/**
 * Renders the details of a searched book and updates the DOM with the book's information.
 * Also displays similar books based on the provided filtered data.
 *
 * @param {Object[]} filteredData - Array of book objects that match the search criteria.
 *                                  Each book object should have the following properties:
 *                                  - bookName {string} - Name of the book.
 *                                  - price {number} - Price of the book.
 *                                  - genre {string} - Genre of the book.
 *                                  - author {string} - Author of the book.
 *                                  - publicationYear {number} - Publication year of the book.
 *                                  - coverImage {string} - URL to the book's cover image.
 * @returns {void} - This function does not return a value.
 */
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
      [bookToExamine] = filteredData.slice(-1);
    } else {
      [bookToExamine] = filteredData;
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

/**
 * Retrieves book data either from local storage or by making a network request.
 * If the data is found in local storage, it is returned as a resolved promise.
 * If the data is not in local storage, it fetches it from the network, stores it in local storage,
 * and then returns it as a resolved promise. In case of an error during the fetch operation,
 * it logs the error and returns an empty array.
 *
 * @returns {Promise<Object[]>} A promise that resolves to an array of book objects.
 *                              Each book object should have the following properties:
 *                              - bookId {string} - Unique identifier of the book.
 *                              - bookName {string} - Name of the book.
 *                              - price {number} - Price of the book.
 *                              - genre {string} - Genre of the book.
 *                              - author {string} - Author of the book.
 *                              - publicationYear {number} - Publication year of the book.
 *                              - coverImage {string} - URL to the book's cover image.
 */
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
      // data = [];
      // return data;
    });
}

/**
 * Retrieves book data either from local storage or by making a network request.
 * If the data is found in local storage, it parses and assigns it to the `data` variable.
 * If the data is not in local storage, it fetches it from the network, parses the response,
 * stores it in local storage, and assigns it to the `data` variable.
 * In case of an error during the fetch operation, it logs the error to the console.
 *
 * @async
 * @function getBooksData
 * @returns {Promise<void>} A promise that resolves when the data has been fetched and stored.
 * @throws {Error} Throws an error if fetching the data fails.
 */
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

/**
 * Saves the current filter state to local storage.
/**
  * The filter state includes the values of the book name, book genre,
  * price range, author, and publication year filters.
  * This state is stored in local storage under the key 'filterState' in JSON format. *
 * @function savePageState
 * @returns {void} This function does not return any value.
 */
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

/**
 * Loads the saved filter state from local storage and applies it to the filter input elements.
 * The filter state is retrieved from local storage under the key 'filterState'.
 * If a saved state exists, it updates the values of the filter input elements
 * to match the saved state.
 * This function is used to restore the filter settings when the page is reloaded or revisited. *
 * @function loadPageState
 * @returns {void} This function does not return any value.
 */
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

/**
 * Handles sorting of book data based on the specified value type and table type.
/**
  * This function sorts the data in either the 'similar-books-table' or
  * 'all-books-table' based on the provided value type.
  * The sorting order is toggled between ascending and descending each time
  * the function is called. * @function handleSort
 * @param {string} valType - The type of value to sort by. Can be 'price' or 'year'.
 * @param {string} tableType - The type of table to sort. Can be 'similar-books-table'
*                             or 'all-books-table'.
  * @returns {void} This function does not return any value. */
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

/**
/**
  * Handles the search functionality by applying various filters to the book data
  * and rendering the results.
  * The function collects filter values from the input fields, applies them to the data
  * using `filterData`, and then sorts and displays the filtered results. It also saves
  * the current filter state to local storage. *
/**
  * Handles the search functionality by applying various filters to the book data
  * and rendering the results.
  * @returns {void} This function does not return any value. */
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

/**
 * Retrieves the examined book from local storage and renders its details,
 * followed by rendering all books.
 *
 * The function fetches the book details from local storage, if available, and displays
 * the details using `renderSearchedBookDetails`. It then calls `renderAllBooks`
 * to display the list of all books.
 *
 * @function handleExaminedBookAndRender
 * @returns {void} This function does not return any value.
 */
const handleExaminedBookANdRender = () => {
  const examinedBook = JSON.parse(localStorage.getItem('examinedBook'));
  if (examinedBook) {
    renderSearchedBookDetails([examinedBook]);
  }
  renderAllBooks();
};

/**
 * Initializes the application by loading the page state, fetching book data,
 * and rendering the examined book and all books.
 *
 * The function performs the following tasks:
 * 1. Loads the page state from local storage using `loadPageState`.
 * 2. Fetches book data using `getBooksDataPromises`, and upon successful data retrieval,
 *    it calls `handleExaminedBookAndRender` to render the details of the examined book
 *    (if any) and the list of all books.
 *
 * @async
 * @function initialize
 * @returns {Promise<void>} This function returns a Promise that resolves when
 * the initialization is complete.
 */
const initialize = async () => {
  loadPageState();
  // await getBooksData();
  // handleExaminedBookANdRender();
  getBooksDataPromises().then(handleExaminedBookANdRender);
};
initialize();
