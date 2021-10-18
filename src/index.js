//import './sass/main.scss';

import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '23914830-fa688dbc9c3ce71713860e5a5';
const SearchForm = document.querySelector('form#search-form');
const inputSearch = document.querySelector("input[name='searchQuery']");
const gallery = document.querySelector('div.gallery');
const btnLoadMore = document.querySelector('button.load-more');
let perPage = 40;
let page = 0;
btnLoadMore.style.display = 'none';

async function fetchPictures(inputSearchValue, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${inputSearchValue}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`,
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function showPictures(e) {
  e.preventDefault();
  gallery.innerHTML = '';
  page = 1;
  let inputSearchValue = inputSearch.value;
  fetchPictures(inputSearchValue, page)
    .then(responseData => {
      let picsArray = responseData.hits.length;
      const totalPages = Math.ceil(responseData.totalHits / perPage);

      if (picsArray === 0) {
        Notiflix.Notify.warning(
          'Sorry, there are no images matching your search query. Please try again.',
        );
      } else {
        renderGallery(responseData);
        Notiflix.Notify.success(`Hooray! We found ${responseData.totalHits} images.`);
        if (page < totalPages) {
          btnLoadMore.style.display = 'block';
        }
      }
      const lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });
    })
    .catch(error => console.log(error));
}

SearchForm.addEventListener('submit', showPictures);

const loadMore = () => {
  btnLoadMore.style.display = 'none';
  let inputSearchValue = inputSearch.value;
  page += 1;
  fetchPictures(inputSearchValue, page)
    .then(responseData => {
      renderGallery(responseData);
      btnLoadMore.style.display = 'block';

      const totalPages = Math.ceil(responseData.totalHits / perPage);
      let picsArray = responseData.hits.length;
      if (picsArray > 0) {
        renderGallery(responseData);
        btnLoadMore.style.display = 'block';

        if (page >= totalPages) {
          btnLoadMore.style.display = 'none';
          Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
        } 
      }
    })
    .catch(error => console.log(error));
};
btnLoadMore.addEventListener('click', loadMore);


const renderGallery = responseData => {
  const markup = responseData.hits
    .map(
      hit =>
        `<div class="photo-card gallery-item">
        <a class="gallery-link" href=${hit.largeImageURL}>
      <img class="gallery-image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
      </a>
      <div class="info">
      <p class="info-item">
      <b>Likes</b>  &nbsp ${hit.likes}  &nbsp👍
      </p>
      <p class="info-item">
      <b>Views</b>  &nbsp ${hit.views}  &nbsp🧐
      </p>
      <p class="info-item">
      <b>Comments</b>  &nbsp ${hit.comments}  &nbsp📝
      </p>
      <p class="info-item">
      <b>Downloads</b>  &nbsp ${hit.downloads}  &nbsp📁
      </p>
      </div>
      </div>`,
    )
    .join('');

  gallery.innerHTML = markup;
};