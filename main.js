const global = {
  currentPage: window.location.pathname,
  allCountries: null,
};

const BASE_URL = 'https://restcountries.com/v3.1/';

const renderCountries = (countries, containerId) => {
  const container = document.getElementById(`${containerId}`);
  container.innerHTML = '';

  if (!countries || countries.length === 0) {
    container.innerHTML = `<div class="centered-message">No matching countries found.</div>`;
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
  const container = 'countries-container';

  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', onSearch);
  }

  try {
    spinner.style.display = 'flex';

    const response = await fetch(
      `${BASE_URL}all?fields=name,capital,flag,languages,currencies,borders,area,region,population,flags`
    );

    if (!response.ok) {
      document.getElementById(
        container
      ).innerHTML = `<div class="centered-message">Failed to fetch countries</div>`;
      return;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      document.getElementById(
        container
      ).innerHTML = `<div class="centered-message">Countries not found</div>`;
      return;
    }

    global.allCountries = data.sort((a, b) => b.population - a.population);

    const sort = document.getElementById('sortFilter');
    if (sort) {
      sort.addEventListener('change', () => {
        switch (sort.value) {
          case 'az':
            global.allCountries = data.sort((a, b) =>
              a.name.common.localeCompare(b.name.common)
            );
            break;
          case 'za':
            global.allCountries = data.sort((a, b) =>
              b.name.common.localeCompare(a.name.common)
            );
            break;
          case 'population-asc':
            global.allCountries = data.sort(
              (a, b) => a.population - b.population
            );
            break;
          case 'population-desc':
            global.allCountries = data.sort(
              (a, b) => b.population - a.population
            );
            break;
          case 'region':
            global.allCountries = data.sort((a, b) =>
              a.region.localeCompare(b.region)
            );
            break;
        }
        renderCountries(data, container);
      });
    }

    renderCountries(data, container);
  } catch (error) {
    console.error('Error fetching countries:', error);
    document.getElementById(
      container
    ).innerHTML = `<div class="centered-message">Error loading countries.</div>`;
  } finally {
    spinner.style.display = 'none';
  }
};

const displayCountryDetails = async () => {
  const spinner = document.querySelector('.spinner');
  const params = new URLSearchParams(window.location.search);
  const countryName = params.get('country');

  if (!countryName) {
    document.getElementById(
      'details-container'
    ).innerHTML = `<div class="centered-message">No country specified</div>`;
    return;
  }

  try {
    const spinner = document.querySelector('.spinner');
    const container = document.getElementById('details-container');

    spinner.style.display = 'flex';

    const response = await fetch(
      `${BASE_URL}name/${encodeURIComponent(countryName)}?fullText=true`
    );

    if (!response.ok) {
      container.innerHTML = `<div class="centered-message">Failed to fetch countries</div>`;
      return;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      container.innerHTML = `<div class="centered-message">Countries not found</div>`;
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
    document.getElementById(
      'details-container'
    ).innerHTML = `<div class="centered-message">Error loading country details.</div>`;
  } finally {
    spinner.style.display = 'none';
  }
};

const onSearch = () => {
  const search = document.getElementById('search');
  const query = search.value.toLowerCase();

  if (!global.allCountries) return;

  const filteredData = global.allCountries.filter((country) =>
    country.name.common.toLowerCase().includes(query)
  );
  renderCountries(filteredData, 'countries-container');
};

const getFavoriteCountries = () => {
  const countries = localStorage.getItem('favoriteCountries');
  return countries ? JSON.parse(countries) : [];
};

const loadFavoriteCountries = () => {
  const countries = getFavoriteCountries();
  const container = 'favorites-container';

  if (countries.length === 0) {
    document.getElementById(
      container
    ).innerHTML = `<div class="centered-message">No favorite countries saved.</div>`;
    return;
  }

  renderCountries(countries, container);

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('remove');
  deleteBtn.textContent = 'Remove all';
  document.getElementById(container).appendChild(deleteBtn);
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
  localStorage.removeItem('favoriteCountries');
  loadFavoriteCountries();
};

const init = () => {
  switch (global.currentPage) {
    case '/':
    case '/index.html':
      displayCountries();
      break;
    case '/details.html':
      displayCountryDetails();
      break;
    case '/favorites.html':
      loadFavoriteCountries();
      break;
  }
};

document.addEventListener('DOMContentLoaded', init);
