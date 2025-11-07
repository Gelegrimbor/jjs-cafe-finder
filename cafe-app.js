let map;
let infowindow;
let markers = [];

async function initMap() {
    console.log('===== CAFE FINDER STARTING =====');

    const kl = { lat: 3.1390, lng: 101.6869 };

    map = new google.maps.Map(document.getElementById('map'), {
        center: kl,
        zoom: 14
    });

    console.log('===== MAP CREATED =====');

    infowindow = new google.maps.InfoWindow();

    await searchCafes(kl);
    addSearchControl();
}

async function searchCafes(location) {
    console.log('===== SEARCHING FOR CAFES =====');
    console.log('Location:', location);

    clearMarkers();

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
    <div class="loading">
        <h3>🔍 Searching for cafes...</h3>
        <p>Finding the best coffee spots near you</p>
    </div>
`;

    if (!results || results.length === 0) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `
        <div class="empty-state">
            <h3>😔 No cafes found</h3>
            <p>Try searching in a different area or increase the search radius</p>
        </div>
    `;
        return;
    }

    new google.maps.Marker({
        position: location,
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(50, 50)
        }
    });

    try {
        const { places } = await google.maps.importLibrary("places");

        console.log('===== LIBRARY LOADED =====');

        // Search for cafes with keyword filter
        const request = {
            location: location,
            radius: 3000,
            type: 'cafe',
            keyword: 'coffee cafe' // This helps filter results
        };

        console.log('===== CREATING PLACES SERVICE =====');

        const service = new google.maps.places.PlacesService(map);

        console.log('===== CALLING NEARBY SEARCH =====');

        service.nearbySearch(request, (results, status) => {
            console.log('===== API CALLBACK RECEIVED =====');
            console.log('Status:', status);
            console.log('Raw Results:', results);

            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                // Filter out non-cafe places
                const filteredResults = results.filter(place => {
                    const name = place.name.toLowerCase();
                    const types = place.types || [];

                    // Exclude these keywords
                    const excludeKeywords = [
                        'petrol', 'gas', 'station', 'shell', 'petronas', 'caltex',
                        'nasi', 'restoran', 'restaurant', 'mamak', 'kandar',
                        'hotel', 'inn', 'lodge', 'motel',
                        'bank', 'atm', 'pharmacy', 'clinic', 'hospital',
                        'laundry', 'workshop', 'kedai', 'pasar', 'market'
                    ];

                    // Check if name contains excluded keywords
                    const hasExcludedKeyword = excludeKeywords.some(keyword =>
                        name.includes(keyword)
                    );

                    if (hasExcludedKeyword) {
                        console.log('Filtered out:', place.name);
                        return false;
                    }

                    // Include these keywords (positive filter)
                    const includeKeywords = [
                        'cafe', 'coffee', 'kopi', 'espresso', 'cappuccino',
                        'latte', 'barista', 'brew', 'bean', 'roast'
                    ];

                    const hasIncludedKeyword = includeKeywords.some(keyword =>
                        name.includes(keyword)
                    );

                    // Include if it has cafe in types OR has coffee-related keywords in name
                    const isCafe = types.includes('cafe') || hasIncludedKeyword;

                    return isCafe;
                });

                console.log('===== FILTERED TO', filteredResults.length, 'ACTUAL CAFES =====');

                if (filteredResults.length === 0) {
                    alert('No cafes found nearby. Try a different location.');
                    return;
                }

                displayResults(filteredResults);

                for (let i = 0; i < filteredResults.length; i++) {
                    createMarker(filteredResults[i], i);
                }
            } else {
                console.log('===== NO RESULTS OR ERROR =====');
                alert('No cafes found or error: ' + status);
            }
        });

    } catch (error) {
        console.error('===== ERROR =====', error);
        alert('Error: ' + error.message);
    }
}

function createMarker(place, index) {
    console.log('Creating marker', index + 1, ':', place.name);

    const position = place.geometry?.location;

    if (!position) {
        console.warn('No position for place');
        return;
    }

    const marker = new google.maps.Marker({
        map: map,
        position: position,
        title: place.name || 'Cafe',
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(40, 40)
        },
        label: {
            text: String(index + 1),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
        }
    });

    markers.push(marker);

    marker.addListener('click', () => {
        const rating = place.rating ? `⭐ ${place.rating}` : 'No rating';

        infowindow.setContent(`
            <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0;">${place.name || 'Cafe'}</h3>
                <p style="margin: 5px 0;">${place.vicinity || ''}</p>
                <p style="margin: 5px 0;"><strong>${rating}</strong></p>
            </div>
        `);
        infowindow.open(map, marker);
    });
}

function displayResults(places) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>☕ Found ${places.length} cafes nearby</h2>
        <p style="color: #666; margin-bottom: 20px; text-align: center;">Click on any cafe to view it on the map</p>
        <div class="results-grid"></div>
    `;

    const grid = resultsDiv.querySelector('.results-grid');

    places.forEach((place, index) => {
        const rating = place.rating ? `${place.rating}` : 'No rating';
        const reviews = place.user_ratings_total ? `(${place.user_ratings_total} reviews)` : '';
        const address = place.vicinity || 'Address not available';

        const card = document.createElement('div');
        card.className = 'place-card';
        card.innerHTML = `
            <h3>
                <span class="place-number">${index + 1}</span>
                <span>${place.name || 'Cafe'}</span>
            </h3>
            <p class="place-rating">
                ⭐ ${rating} <span style="font-weight: normal; color: #888;">${reviews}</span>
            </p>
            <p class="place-address">📍 ${address}</p>
        `;

        card.onclick = () => {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
            if (markers[index]) {
                google.maps.event.trigger(markers[index], 'click');
            }
        };

        grid.appendChild(card);
    });
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function addSearchControl() {
    const btn = document.createElement('button');
    btn.textContent = '📍 Find Cafes Near Me';
    btn.className = 'search-btn';

    btn.onclick = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        btn.textContent = '⏳ Getting your location...';
        btn.disabled = true;

        console.log('===== REQUESTING LOCATION =====');

        // Request high accuracy location
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                console.log('===== LOCATION FOUND =====');
                console.log('Latitude:', position.coords.latitude);
                console.log('Longitude:', position.coords.longitude);
                console.log('Accuracy:', position.coords.accuracy, 'meters');

                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                console.log('Setting map center to:', userLocation);

                map.setCenter(userLocation);
                map.setZoom(15);
                await searchCafes(userLocation);

                btn.textContent = '📍 Find Cafes Near Me';
                btn.disabled = false;
            },
            (error) => {
                console.error('===== LOCATION ERROR =====');
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);

                let errorMsg = 'Could not get your location. ';
                if (error.code === 1) {
                    errorMsg += 'Please allow location access.';
                } else if (error.code === 2) {
                    errorMsg += 'Location unavailable.';
                } else if (error.code === 3) {
                    errorMsg += 'Request timed out.';
                }

                alert(errorMsg);
                btn.textContent = '📍 Find Cafes Near Me';
                btn.disabled = false;
            },
            {
                enableHighAccuracy: true,  // Use GPS, not IP location
                timeout: 10000,            // 10 second timeout
                maximumAge: 0              // Don't use cached location
            }
        );
    };

    document.querySelector('.container').insertBefore(btn, document.getElementById('map'));
}

console.log('===== CAFE-APP.JS LOADED =====');