document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();

    const loginForm = document.getElementById('login-form');
    const logoutLink = document.getElementById('logout-link');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await loginUser(email, password);
            } catch (error) {
                console.error('Error during login:', error);
                alert('Login failed: ' + error.message);
            }
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            logoutUser();
        });
    }

    const countryFilter = document.getElementById('country-filter');
    if (countryFilter) {
        countryFilter.addEventListener('change', (event) => {
            filterPlaces(event.target.value);
        });
    }

    if (window.location.pathname.includes('place.html')) {
        const placeId = getPlaceIdFromURL();
        checkAuthenticationForPlaceDetails(placeId);
    }

    if (window.location.pathname.includes('add_review.html')) {
        const reviewForm = document.getElementById('review-form');

        if (reviewForm) {
            reviewForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const token = getToken();
                const placeId = getPlaceIdFromURL();
                const reviewText = document.getElementById('review').value;
                const rating = document.getElementById('rating').value;

                await submitReview(token, placeId, reviewText, rating);
            });
        }
    }
});

async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ review: reviewText, rating: parseInt(rating) })
        });
        handleResponse(response);
    } catch (error) {
        alert('Failed to submit review');
    }
}

function handleResponse(response) {
    if (response.ok) {
        alert('Review submitted successfully!');
        document.getElementById('review-form').reset();
        const placeId = getPlaceIdFromURL();
        window.location.href = `place.html?place_id=${placeId}`;
    } else {
        alert('Failed to submit review');
    }
}

function getToken() {
    return localStorage.getItem('token') || '';
}

function getPlaceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('place_id');
}

async function loginUser(email, password) {
    const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.access_token}; path=/`;
        window.location.href = 'http://127.0.0.1:5000/';
    } else {
        const errorData = await response.json();
        alert('Login failed: ' + errorData.message);
    }
}

function getCookie(name) {
    let cookieArr = document.cookie.split(";");

    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");

        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }

    return null;
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    if (!token) {
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
    } else {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        fetchPlaces(token);
    }
    return token;
}

async function fetchPlaces(token) {
    try {
        const response = await fetch('http://127.0.0.1:5000/places', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const places = await response.json();
            displayPlaces(places);
            populateCountryFilter(places);
        } else {
            console.error('Failed to fetch places:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching places:', error);
    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = '';

    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.className = 'place-card';

        placeCard.innerHTML = `
            <img src="static/place1.jpg" class="place-image" alt="Place Image">
            <h3>${place.description}</h3>
            <p>Price per night: $${place.price_per_night}</p>
            <p>Location: ${place.city_name}, ${place.country_name}</p>
            <button class="details-button" data-id="${place.id}">View Details</button>
        `;

        placeCard.querySelector('.details-button').addEventListener('click', () => {
            window.location.href = `place.html?place_id=${place.id}`;
        });

        placesList.appendChild(placeCard);
    });
}

function populateCountryFilter(places) {
    const countryFilter = document.getElementById('country-filter');
    const countries = [...new Set(places.map(place => place.country_name))];

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

function filterPlaces(selectedCountry) {
    const placeCards = document.querySelectorAll('.place-card');

    placeCards.forEach(card => {
        const location = card.querySelector('p').innerText.split(': ')[1];
        if (location.includes(selectedCountry) || selectedCountry === 'All') {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function logoutUser() {
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = 'login.html';
}

function checkAuthenticationForPlaceDetails(placeId) {
    const token = getCookie('token');
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
        if (addReviewSection) addReviewSection.style.display = 'none';
        fetchPlaceDetails(null, placeId);
    } else {
        if (addReviewSection) addReviewSection.style.display = 'block';
        fetchPlaceDetails(token, placeId);
    }
}

async function fetchPlaceDetails(token, placeId) {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, { headers });

    if (response.ok) {
        const place = await response.json();
        displayPlaceDetails(place);
    } else {
        console.error('Failed to fetch place details:', response.statusText);
    }
}

function displayPlaceDetails(place) {
    const placeDetailsSection = document.getElementById('place-details');
    placeDetailsSection.innerHTML = '';

    const nameElement = document.createElement('h2');
    nameElement.textContent = place.name;
    placeDetailsSection.appendChild(nameElement);

    const hostElement = document.createElement('p');
    hostElement.innerHTML = `<strong>Host:</strong> ${place.host_name}`;
    placeDetailsSection.appendChild(hostElement);

    const priceElement = document.createElement('p');
    priceElement.innerHTML = `<strong>Price per night:</strong> $${place.price_per_night}`;
    placeDetailsSection.appendChild(priceElement);

    const locationElement = document.createElement('p');
    locationElement.innerHTML = `<strong>Location:</strong> ${place.city_name}, ${place.country_name}`;
    placeDetailsSection.appendChild(locationElement);

    const descriptionElement = document.createElement('p');
    descriptionElement.innerHTML = `<strong>Description:</strong> ${place.description}`;
    placeDetailsSection.appendChild(descriptionElement);

    const amenitiesElement = document.createElement('p');
    amenitiesElement.innerHTML = `<strong>Amenities:</strong> ${place.amenities.join(', ')}`;
    placeDetailsSection.appendChild(amenitiesElement);

    if (place.images && place.images.length > 0) {
        place.images.forEach(image => {
            const imgElement = document.createElement('img');
            imgElement.src = image;
            placeDetailsSection.appendChild(imgElement);
        });
    }

    const reviewsSection = document.getElementById('reviews');
    reviewsSection.innerHTML = '<h2>Reviews</h2>';
    place.reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';

        const reviewAuthor = document.createElement('p');
        reviewAuthor.innerHTML = `<strong>${review.user_name}:</strong>`;
        reviewCard.appendChild(reviewAuthor);

        const reviewComment = document.createElement('p');
        reviewComment.textContent = `Comment: ${review.comment}`;
        reviewCard.appendChild(reviewComment);

        const reviewRating = document.createElement('p');
        reviewRating.textContent = `Rating: ${getStars(review.rating)}`;
        reviewCard.appendChild(reviewRating);

        reviewsSection.appendChild(reviewCard);
    });
}

function getStars(rating) {
    const fullStar = '★';
    const emptyStar = '☆';
    const maxStars = 5;
    let stars = '';

    for (let i = 1; i <= maxStars; i++) {
        stars += i <= rating ? fullStar : emptyStar;
    }

    return stars;
}