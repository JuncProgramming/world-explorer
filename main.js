const global = {
  currentPage: window.location.pathname,
  allCountries: null,
  selectedRegions: [],
};

const BASE_URL = 'https://restcountries.com/v3.1/';

const displayError = (container, message) => {
  container.innerHTML = `<div class="centered-message" role="alert">${message}</div>`;
};

const renderCountries = (countries, container) => {
  container.innerHTML = '';

  if (!countries || countries.length === 0) {
    displayError(container, 'No matching countries found');
    return;
  }

  const favorites = getFavoriteCountries();

  countries.forEach((country) => {
    const div = document.createElement('div');
    div.classList.add('country-card');

    const media = document.createElement('div');
    media.classList.add('country-media');

    const img = document.createElement('img');
    img.src = country.flags?.png || '';
    img.alt = country.flags?.alt || `${country.name.common} flag`;
    img.addEventListener('click', () => {
      window.location.href = `details.html?country=${encodeURIComponent(
        country.name.official
      )}`;
    });

    const favorite = document.createElement('button');
    favorite.classList.add('favorite');
    const icon = document.createElement('i');

    const isFavorite = favorites.some(
      (c) => c.name.official === country.name.official
    );
    icon.classList.add(isFavorite ? 'fa-solid' : 'fa-regular', 'fa-star');
    favorite.appendChild(icon);

    favorite.addEventListener('click', () => {
      const currentlyFavorite = getFavoriteCountries().some(
        (c) => c.name.official === country.name.official
      );

      if (currentlyFavorite) {
        removeFavoriteCountry(country);
        icon.classList.replace('fa-solid', 'fa-regular');
      } else {
        saveFavoriteCountry(country);
        icon.classList.replace('fa-regular', 'fa-solid');
      }
    });

    media.appendChild(img);
    media.appendChild(favorite);

    const info = document.createElement('div');
    info.classList.add('country-info');

    const name = document.createElement('h2');
    name.textContent = country.name?.common || 'Unknown';

    const capital = document.createElement('p');
    capital.textContent = `Capital: ${country.capital?.join(', ') || 'N/A'}`;

    const region = document.createElement('p');
    region.textContent = `Region: ${country.region || 'N/A'}`;

    const population = document.createElement('p');
    population.textContent = `Population: ${
      country.population?.toLocaleString() || 'N/A'
    }`;

    info.appendChild(name);
    info.appendChild(capital);
    info.appendChild(region);
    info.appendChild(population);
    div.appendChild(media);
    div.appendChild(info);
    container.appendChild(div);
  });
};

const displayCountries = async () => {
  const spinner = document.querySelector('.spinner');
  const container = document.getElementById('countries-container');

  try {
    spinner.style.display = 'flex';

    const response = await fetch(
      `${BASE_URL}all?fields=name,capital,flag,languages,currencies,borders,area,region,population,flags`
    );

    const initialCheckboxes = document.querySelectorAll(
      '#filterMenu input[type="checkbox"]:checked'
    );
    global.selectedRegions = Array.from(initialCheckboxes).map(
      (check) => check.value
    );

    if (!response.ok) {
      displayError(container, 'Failed to fetch countries');
      return;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      displayError(container, 'Countries not found');
      return;
    }

    global.allCountries = data;
    const search = document.getElementById('search');
    if (search) search.addEventListener('input', applyAllFiltersAndRender);

    const sort = document.getElementById('sortFilter');
    if (sort) sort.addEventListener('change', applyAllFiltersAndRender);

    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        document.getElementById('filterMenu').classList.toggle('hidden');
      });
    }

    const applyBtn = document.getElementById('applyFilters');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll(
          '#filterMenu input[type="checkbox"]:checked'
        );
        global.selectedRegions = Array.from(checkboxes).map(
          (check) => check.value
        );
        applyAllFiltersAndRender();
      });
    }
    applyAllFiltersAndRender();
  } catch (error) {
    console.error('Error fetching countries:', error);
    displayError(container, 'Error loading countries');
  } finally {
    spinner.style.display = 'none';
  }
};

const displayCountryDetails = async () => {
  const spinner = document.querySelector('.spinner');
  const params = new URLSearchParams(window.location.search);
  const countryName = params.get('country');
  const container = document.getElementById('details-container');

  if (!countryName) {
    displayError(container, 'No country specified');
    return;
  }

  try {
    spinner.style.display = 'flex';

    const response = await fetch(
      `${BASE_URL}name/${encodeURIComponent(countryName)}?fullText=true`
    );

    if (!response.ok) {
      displayError(container, 'Failed to fetch countries');
      return;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      displayError(container, 'Countries not found');
      return;
    }

    const country = data[0];
    const countries = getFavoriteCountries();

    const pageHeader = document.querySelector('#details-header');
    pageHeader.textContent = `${country.name.official}`;

    container.innerHTML = '';

    const card = document.createElement('div');
    card.classList.add('country-detail-card');

    const flag = document.createElement('img');
    flag.src = country.flags?.png || '';
    flag.alt = country.flags?.alt || `${country.name.common} flag`;
    flag.classList.add('flag');

    const info = document.createElement('div');
    info.classList.add('country-info');

    const infoHeader = document.createElement('div');
    infoHeader.classList.add('info-header');

    const favorite = document.createElement('button');
    favorite.classList.add('favorite');
    const icon = document.createElement('i');
    const isFavorite = countries.some(
      (c) => c.name.official === country.name.official
    );
    isFavorite
      ? icon.classList.add('fa-solid', 'fa-star')
      : icon.classList.add('fa-regular', 'fa-star');
    favorite.appendChild(icon);

    favorite.addEventListener('click', () => {
      const currentlyFavorite = getFavoriteCountries().some(
        (c) => c.name.official === country.name.official
      );

      if (currentlyFavorite) {
        removeFavoriteCountry(country);
        icon.classList.replace('fa-solid', 'fa-regular');
      } else {
        saveFavoriteCountry(country);
        icon.classList.replace('fa-regular', 'fa-solid');
      }
    });

    const name = document.createElement('h2');
    name.textContent = country.name.common;

    const capital = document.createElement('p');
    capital.innerHTML = `<strong>Capital:</strong> ${
      country.capital?.join(', ') || 'N/A'
    }`;

    const region = document.createElement('p');
    region.innerHTML = `<strong>Region:</strong> ${country.region}`;

    const population = document.createElement('p');
    population.innerHTML = `<strong>Population:</strong> ${country.population?.toLocaleString()}`;

    const area = document.createElement('p');
    area.innerHTML = `<strong>Area:</strong> ${country.area?.toLocaleString()} km²`;

    const languages = document.createElement('p');
    languages.innerHTML = `<strong>Languages:</strong> ${
      country.languages ? Object.values(country.languages).join(', ') : 'N/A'
    }`;

    const currencies = document.createElement('p');
    currencies.innerHTML = `<strong>Currencies:</strong> ${
      country.currencies
        ? Object.values(country.currencies)
            .map((c) => `${c.name} (${c.symbol})`)
            .join(', ')
        : 'N/A'
    }`;
    infoHeader.appendChild(name);
    infoHeader.appendChild(favorite);
    info.appendChild(infoHeader);
    info.appendChild(capital);
    info.appendChild(region);
    info.appendChild(population);
    info.appendChild(area);
    info.appendChild(languages);
    info.appendChild(currencies);
    card.appendChild(flag);
    card.appendChild(info);
    container.appendChild(card);
  } catch (error) {
    console.error('Error fetching country details:', error);
    displayError(container, 'Error loading country details');
  } finally {
    spinner.style.display = 'none';
  }
};

function applyAllFiltersAndRender() {
  const container = document.getElementById('countries-container');

  if (!global.allCountries) return;

  let filtered = [...global.allCountries];

  if (global.selectedRegions.length > 0) {
    filtered = filtered.filter((country) =>
      global.selectedRegions.includes(country.region)
    );
  }

  const searchTerm = document.getElementById('search').value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter((country) =>
      country.name.common.toLowerCase().includes(searchTerm)
    );
  }

  const sortValue = document.getElementById('sortFilter').value;
  switch (sortValue) {
    case 'az':
      filtered.sort((a, b) => a.name.common.localeCompare(b.name.common));
      break;
    case 'za':
      filtered.sort((a, b) => b.name.common.localeCompare(a.name.common));
      break;
    case 'population-asc':
      filtered.sort((a, b) => a.population - b.population);
      break;
    case 'population-desc':
      filtered.sort((a, b) => b.population - a.population);
      break;
    case 'region':
      filtered.sort((a, b) => a.region.localeCompare(b.region));
      break;
    default:
      filtered.sort((a, b) => b.population - a.population);
  }

  renderCountries(filtered, container);
}

const onSearch = () => {
  const container = document.getElementById('countries-container');
  const search = document.getElementById('search');
  const query = search.value.toLowerCase();

  if (!global.allCountries) return;

  const filteredData = global.allCountries.filter((country) =>
    country.name.common.toLowerCase().includes(query)
  );
  renderCountries(filteredData, container);
};

const getFavoriteCountries = () => {
  const countries = localStorage.getItem('favoriteCountries');
  return countries ? JSON.parse(countries) : [];
};

const loadFavoriteCountries = () => {
  const countries = getFavoriteCountries();
  const container = document.getElementById('favorites-container');

  container.innerHTML = '';

  if (countries.length === 0) {
    displayError(container, 'No favorite countries saved');
    return;
  }

  renderCountries(countries, container);

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('remove');
  deleteBtn.textContent = 'Remove all';
  container.appendChild(deleteBtn);
  deleteBtn.addEventListener('click', removeAllFavoriteCountries);
};

const saveFavoriteCountry = (country) => {
  const countries = getFavoriteCountries();
  const mappedCountries = countries.map((c) => c.name.official);
  if (mappedCountries.includes(country.name.official)) return;
  countries.push(country);
  localStorage.setItem('favoriteCountries', JSON.stringify(countries));
};

const removeFavoriteCountry = (country) => {
  const countries = getFavoriteCountries();
  const filteredCountries = countries.filter(
    (c) => c.name.official !== country.name.official
  );
  localStorage.setItem('favoriteCountries', JSON.stringify(filteredCountries));
};

const removeAllFavoriteCountries = () => {
  if (
    confirm('Are you sure you want to delete all countries from favorites?')
  ) {
    localStorage.removeItem('favoriteCountries');
    loadFavoriteCountries();
  }
};

const init = () => {
  switch (true) {
    case global.currentPage.endsWith('/') ||
      global.currentPage.endsWith('/index.html'):
      displayCountries();
      break;
    case global.currentPage.endsWith('/details.html'):
      displayCountryDetails();
      break;
    case global.currentPage.endsWith('/favorites.html'):
      loadFavoriteCountries();
      break;
    default:
      console.log('Page not recognized:', global.currentPage);
  }
};

document.addEventListener('DOMContentLoaded', init);
