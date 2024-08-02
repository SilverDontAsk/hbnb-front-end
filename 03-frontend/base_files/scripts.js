/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();

          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;

          try {
              const response = await fetch('https://your-api-url/login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ email, password })
              });

              if (response.ok) {
                  const data = await response.json();
                  document.cookie = `token=${data.access_token}; path=/`;
                  window.location.href = 'index.html';
              } else {
                  const errorData = await response.json();
                  alert('Login failed: ' + (errorData.message || response.statusText));
              }
          } catch (error) {
              console.error('Error during login:', error);
              alert('An error occurred. Please try again.');
          }
      });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
  
  const countryFilter = document.getElementById('country-filter');
  if (countryFilter) {
      countryFilter.addEventListener('change', (event) => {
          const selectedCountry = event.target.value;
          filterPlacesByCountry(selectedCountry);
      });
  }
});

function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (!token) {
      loginLink.style.display = 'block';
  } else {
      loginLink.style.display = 'none';
      fetchPlaces(token);
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchPlaces(token) {
  try {
      const response = await fetch('https://your-api-url/places', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (response.ok) {
          const places = await response.json();
          displayPlaces(places);
      } else {
          console.error('Failed to fetch places:', response.statusText);
      }
  } catch (error) {
      console.error('Error during fetching places:', error);
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  const countryFilter = document.getElementById('country-filter');

  placesList.innerHTML = '';
  const countries = new Set();

  places.forEach(place => {
      const placeDiv = document.createElement('div');
      placeDiv.className = 'place';
      placeDiv.innerHTML = `
          <h3>${place.name}</h3>
          <p>${place.description}</p>
          <p>Location: ${place.location}</p>
          <p>Country: ${place.country}</p>
      `;
      placesList.appendChild(placeDiv);
      countries.add(place.country);
  });

  // Populate the country filter dropdown
  countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countryFilter.appendChild(option);
  });
}

function filterPlacesByCountry(selectedCountry) {
  const placesList = document.getElementById('places-list');
  const places = placesList.getElementsByClassName('place');

  for (let place of places) {
      if (selectedCountry === '' || place.querySelector('p:nth-child(4)').textContent.includes(selectedCountry)) {
          place.style.display = 'block';
      } else {
          place.style.display = 'none';
      }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const placeId = getPlaceIdFromURL();
  checkAuthentication(placeId);

  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
      reviewForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          await submitReview(placeId);
      });
  }
});

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('place_id');
}

function checkAuthentication(placeId) {
  const token = getCookie('token');
  const addReviewSection = document.getElementById('add-review');

  if (!token) {
      addReviewSection.style.display = 'none';
  } else {
      addReviewSection.style.display = 'block';
      fetchPlaceDetails(token, placeId);
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchPlaceDetails(token, placeId) {
  try {
      const response = await fetch(`https://your-api-url/places/${placeId}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (response.ok) {
          const place = await response.json();
          displayPlaceDetails(place);
      } else {
          console.error('Failed to fetch place details:', response.statusText);
      }
  } catch (error) {
      console.error('Error during fetching place details:', error);
  }
}

function displayPlaceDetails(place) {
  const placeDetails = document.getElementById('place-details');
  placeDetails.innerHTML = '';

  const placeDiv = document.createElement('div');
  placeDiv.className = 'place-detail';
  placeDiv.innerHTML = `
      <h2>${place.name}</h2>
      <p>${place.description}</p>
      <p>Location: ${place.location}</p>
      <div class="place-images">
          ${place.images.map(image => `<img src="${image.url}" alt="${place.name}">`).join('')}
      </div>
  `;
  placeDetails.appendChild(placeDiv);
}

async function submitReview(placeId) {
  const reviewText = document.getElementById('review-text').value;
  const token = getCookie('token');

  try {
      const response = await fetch(`https://your-api-url/places/${placeId}/reviews`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ review: reviewText })
      });

      if (response.ok) {
          alert('Review submitted successfully!');
          window.location.reload();
      } else {
          alert('Failed to submit review: ' + response.statusText);
      }
  } catch (error) {
      console.error('Error during review submission:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
      const token = checkAuthentication();
      const placeId = getPlaceIdFromURL();

      const reviewForm = document.getElementById('review-form');
      if (reviewForm) {
          reviewForm.addEventListener('submit', async (event) => {
              event.preventDefault();
              const reviewText = document.getElementById('review-text').value;
              await submitReview(token, placeId, reviewText);
          });
      }
  } catch (error) {
      console.error('Error during page load:', error);
  }
});

function checkAuthentication() {
  const token = getCookie('token');
  if (!token) {
      window.location.href = 'index.html';
  }
  return token;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('place_id');
}

async function submitReview(token, placeId, reviewText) {
  try {
      const response = await fetch(`https://your-api-url/places/${placeId}/reviews`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ review: reviewText })
      });

      handleResponse(response);
  } catch (error) {
      console.error('Error during review submission:', error);
      alert('Failed to submit review');
  }
}

function handleResponse(response) {
  if (response.ok) {
      alert('Review submitted successfully!');
      document.getElementById('review-form').reset();
  } else {
      alert('Failed to submit review');
  }
}
