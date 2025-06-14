const global = {
  currentPage: window.location.pathname,
};

const BASE_URL = 'https://restcountries.com/v3.1/';

const displayCountries = async () => {
  try {
    const container = document.getElementById('countries-container');
    container.innerHTML = '';
    const countries = getFavoriteCountries();
    const response = await fetch(
      `${BASE_URL}all?fields=name,capital,flag,languages,currencies,borders,area,region,population,flags`
    );

    if (!response.ok) {
      document.getElementById('countries-container').textContent =
        'Failed to fetch countries';
      return;
    }
    const data = await response.json();

    if (!data || data.length === 0) {
      document.getElementById('countries-container').textContent =
        'Countries not found';
      return;
    }
    data.forEach((country) => {
      const div = document.createElement('div');
      div.classList.add('country-card');

      const media = document.createElement('div');
      media.classList.add('country-media');

      const img = document.createElement('img');
      img.src = country.flags?.png || '';
      img.alt = country.flags?.alt || `${country.name.common} flag`;
      img.addEventListener('click', () => {
        window.location.href = `details.html?country=${encodeURIComponent(
          country.name.common
        )}`;
      });

      const favorite = document.createElement('button');
      favorite.classList.add('favorite');
      const icon = document.createElement('i');

      const isFavorite = countries.some(
        (c) => c.name.common === country.name.common
      );
      isFavorite
        ? icon.classList.add('fa-solid', 'fa-star')
        : icon.classList.add('fa-regular', 'fa-star');
      favorite.appendChild(icon);

      favorite.addEventListener('click', () => {
        const currentlyFavorite = getFavoriteCountries().some(
          (c) => c.name.common === country.name.common
        );

        if (currentlyFavorite) {
          icon.classList.replace('fa-solid', 'fa-regular');
          removeFavoriteCountry(country);
        } else {
          icon.classList.replace('fa-regular', 'fa-solid');
          saveFavoriteCountry(country);
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
  } catch (error) {
    console.error('Error fetching countries:', error);
    document.getElementById('countries-container').textContent =
      'Error loading countries';
  }
};

const displayCountryDetails = async () => {
  const params = new URLSearchParams(window.location.search);
  const countryName = params.get('country');

  if (!countryName) {
    document.getElementById('details-container').textContent =
      'No country specified.';
    return;
  }

  try {
    const container = document.getElementById('details-container');
    const response = await fetch(
      `${BASE_URL}name/${encodeURIComponent(countryName)}?fullText=true`
    );

    if (!response.ok) {
      container.textContent = 'Failed to fetch countries';
      return;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      container.textContent = 'Countries not found';
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
      (c) => c.name.common === country.name.common
    );
    isFavorite
      ? icon.classList.add('fa-solid', 'fa-star')
      : icon.classList.add('fa-regular', 'fa-star');
    favorite.appendChild(icon);

    favorite.addEventListener('click', () => {
      const currentlyFavorite = getFavoriteCountries().some(
        (c) => c.name.common === country.name.common
      );

      if (currentlyFavorite) {
        icon.classList.replace('fa-solid', 'fa-regular');
        removeFavoriteCountry(country);
      } else {
        icon.classList.replace('fa-regular', 'fa-solid');
        saveFavoriteCountry(country);
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
    document.getElementById('details-container').textContent =
      'Error loading country details.';
  }
};

const getFavoriteCountries = () => {
  const countries = localStorage.getItem('countries');
  return countries ? JSON.parse(countries) : [];
};

const loadFavoriteCountries = () => {
  const countries = getFavoriteCountries();
  const container = document.getElementById('favorites-container');
  container.innerHTML = '';

  if (countries.length === 0) {
    container.textContent = 'No favorite countries saved.';
    return;
  }

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
        country.name.common
      )}`;
    });

    const favorite = document.createElement('button');
    favorite.classList.add('favorite');
    const icon = document.createElement('i');
    icon.classList.add('fa-solid', 'fa-star');
    favorite.appendChild(icon);

    favorite.addEventListener('click', () => {
      removeFavoriteCountry(country);
      loadFavoriteCountries();
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

const saveFavoriteCountry = (country) => {
  const countries = getFavoriteCountries();
  const mappedCountries = countries.map((c) => c.name.common);
  if (mappedCountries.includes(country.name.common)) return;
  countries.push(country);
  localStorage.setItem('countries', JSON.stringify(countries));
};

const removeFavoriteCountry = (country) => {
  const countries = getFavoriteCountries();
  const filteredCountries = countries.filter(
    (c) => c.name.common !== country.name.common
  );
  localStorage.setItem('countries', JSON.stringify(filteredCountries));
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
