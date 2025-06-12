const global = {
  currentPage: window.location.pathname,
};

const BASE_URL =
  'https://restcountries.com/v3.1/all?fields=name,capital,flag,languages,currencies,borders,area,region,population,flags';

const displayCountries = async () => {
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    const container = document.getElementById('countries-container');

    data.forEach((country) => {
      const div = document.createElement('div');
      div.classList.add('country-card');

      const media = document.createElement('div');
      media.classList.add('country-media');

      const img = document.createElement('img');
      img.src = country.flags?.png || '';
      img.alt = country.flags?.alt || `${country.name.common} flag`;

      const favorite = document.createElement('button');
      favorite.textContent = '☆ Add to Favorites';
      favorite.classList.add('favorite');

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
  }
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
      displayFavorites();
      break;
  }
};

document.addEventListener('DOMContentLoaded', init);
