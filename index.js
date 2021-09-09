const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
let showStyle = 0 //新增一個變數作為switch ，0 = Cards Style， 1 = List Style)
let page = 1 // 預設頁碼為第一頁。頁碼器上的監聽，會依選擇的page來更新此變數，讓所有函式功能可以跟隨此頁碼

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const btnShowStyle = document.querySelector('#btn-show-style') // 新增顯示模式位置
const btnCards = document.querySelector('.btn-cards') // 新增卡片顯示模式按鈕位置
const btnList = document.querySelector('.btn-list') // 新增清單顯示模式按鈕位置
let AllAddButtons = []



//-------------------------------- Function Area------------------------------------------//

// 新增參數，showStyle作為要依哪種方式呈現電影資料
function renderMovieList(data) {
  //在這邊加入新判斷式 showStyle，0 = Cards Style， 1 = List Style)，好處是不用再寫一個函式，也不用往回在所有監聽器加上判斷要用哪一個函式去顯示電影資料。
  if (showStyle === 0) {
    let rawHTML = ''
    data.forEach((item) => {
      rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top"
              alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
    })
    dataPanel.innerHTML = rawHTML
    //新增第二種顯示方式的HTML格式資料
  } else {
    let rawHTML = ''
    data.forEach((item) => {
      rawHTML += `
      <div class="col-12 border-top mb-2">
        <div class="row mt-2">
          <div class="card-title col-9">${item.title}</div>
          <div class="col-3">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
              data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}" >+</button>
          </div>
        </div>
      </div>
    `
    })
    rawHTML += `<div class="col-12 border-top mb-3"></div>`
    dataPanel.innerHTML = rawHTML
  }
  markedFavorite()
}


//頁碼產生器函式
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item "><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
  //每當產生頁碼時，標示正在哪一頁中，預設為第一頁
  paginator.children[page - 1].firstElementChild.classList.add('bg-primary', 'text-white')
}



//帶入頁碼，依照需要顯示筆數，返回新的電影陣列資料，給renderMovieList呈現
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


//將正確資料帶入Modal，按More時可以正確顯示的函式
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  const movie = movies.find(movie => movie.id === id)

  modalTitle.innerText = movie.title
  modalImage.firstElementChild.src = POSTER_URL + movie.image
  modalDate.innerText = 'Release : ' + movie.release_date
  modalDescription.innerText = movie.description
}


//將喜歡的電影資料存入localStorage
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  if (list.some(movie => movie.id === id)) {
    return alert('電影已經在收藏清單中')
  }
  list.push(movies.find(movie => movie.id === id))
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//已收藏電影在+符號改為顯示Collected，放在panel監聽器的+符號及renderMovieList最後方
function markedFavorite() {
  //找出畫面上所有電影名稱
  const panelMovies = document.querySelectorAll('.card-title')
  //將最愛電影從localStorage取出放入變數favoriteMoviesList
  const favoriteMoviesList = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //將favoriteMoviesList全部的電影名稱取出放入變數favoriteMoviesTitle
  const favoriteMoviesTitle = favoriteMoviesList.map(movie => movie.title)
  //檢查panel畫面上每一部電影
  for (let i = 0; i < panelMovies.length; i++) {
    //確認畫面上電影哪些已加入我的最愛
    //如果favoriteMoviesTitle的電影名稱內包含畫面上第i部電影名稱
    if (favoriteMoviesTitle.includes(panelMovies[i].innerText)) {
      AllAddButtons = document.querySelectorAll('.btn-add-favorite') // 新增所有新增最愛按鈕位置
      //將按鈕內文字+改為Collected
      AllAddButtons[i].innerText = `Collected`
      //將按鈕改為無效
      AllAddButtons[i].setAttribute('disabled', '')
      //將按鈕顏色改為淺灰色
      AllAddButtons[i].classList.add('btn-light')
    }
  }
}



//-------------------------------- EventListener Area------------------------------------------//

//panel監聽器---在顯示電影資料的區域新增監聽，讓more按鈕跟+按鈕執行各自功能
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
    markedFavorite()
  }
})

//頁碼監聽器---讓頁面顯示資料依照所點選的分頁去處理
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
  //新增data運算子，因為每次點選換頁按鈕都得重新渲染頁面按鈕，更新顯示正在哪一頁上
  //所以要看是依filteredMovies來重新渲染頁碼或是movies來重新渲染頁碼，
  //如果搜尋情況下filteredMovies會有資料，將會依搜尋結果的情況下去產生頁碼，若否則會依照原本movies的資料長度去產生頁碼
  const data = filteredMovies.length ? filteredMovies : movies
  renderPaginator(data.length)
})

//搜尋欄監聽器---，取消預設動作，依照keyword去過濾電影，並顯示於頁面上
searchForm.addEventListener('input', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  //當輸入欄裡是空的或空白則，要將filteredMovies清空
  //(不清空的話，filteredMovies會保留之前的搜尋結果)，
  //連續操作下getMoviesByPage()函式可能會去抓到filteredMovies的資料。
  if (!keyword.length) {
    filteredMovies = []
    renderMovieList(getMoviesByPage(1))
    renderPaginator(movies.length)
    return
  }
  //若輸入欄裡有數值則，過濾movies到filterMovies
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  //如果過濾出來的filteredMovies的資料長度為0，則顯示找不到相關的電影
  if (filteredMovies.length === 0) {
    return alert('Cannot find movie with keyword : ' + keyword)
  }
  //否則就渲染過濾後的頁面及過濾後的電影
  renderMovieList(getMoviesByPage(1))
  renderPaginator(filteredMovies.length)
})


//樣式顯示監聽器 (新增監聽器)
btnShowStyle.addEventListener('click', event => {
  // 先取消Tag a的預設動作
  event.preventDefault()
  // 加入判斷式，如果選到卡片
  if (event.target.matches('.btn-cards')) {
    //賦予變數 showStyle 為 0 ，並更改按鈕顏色樣式，之後執行renderMovieList，後面帶入第二個新引數showStyle
    showStyle = 0
    btnList.classList.remove('text-primary')
    btnList.classList.add('text-secondary')
    btnCards.classList.remove('text-secondary')
    btnCards.classList.add('text-primary')
    renderMovieList(getMoviesByPage(page))
    // 加入判斷式，如果選到清單
  } else if (event.target.matches('.btn-list')) {
    //賦予變數 showStyle 為 1 ，並更改按鈕顏色樣式，之後執行renderMovieList，後面帶入第二個新引數showStyle
    showStyle = 1
    btnList.classList.remove('text-secondary')
    btnList.classList.add('text-primary')
    btnCards.classList.remove('text-primary')
    btnCards.classList.add('text-secondary')
    renderMovieList(getMoviesByPage(page))
  } else {
    return
  }
})

//-------------------------------- Start ------------------------------------------//
//取得電影資料，然後初步渲染資料至頁面上，產生頁碼
axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderMovieList(getMoviesByPage(1))
  renderPaginator(movies.length)
})

