const form = document.querySelector('form');
const searchArea = document.querySelector('#search__area');
const infoContainer = document.querySelector('.info__container');
const loader = document.querySelector('#preloader');
const noBorderCountry = document.createElement('div');
noBorderCountry.classList.add('info__paragraph');
let counter = 0;

const request = async (url) => {
	console.clear();
	const response = await fetch(url);
	if (!response.ok) {
		alert('Вы ввели страну неверно!');
		loader.style.display = 'none';
		searchArea.value = '';
		throw Error('Request error' + response.status);
	};
	return await response.json();
}

const addFn = (firstParent, secondParent, value) => {
	firstParent.append(value);
	secondParent.append(firstParent);
}

const run = async () => {
	const borders = await information(searchArea.value);
	const borderCountries = await Promise.all(borders.map(country => request(`http://146.185.154.90:8080/restcountries/rest/v2/alpha/${country}?fields=name`)));
	const countries = await Promise.all(borderCountries.map(country => information(country.name)));
	loader.style.display = 'none';
}

const information = async (value) => {
	const countries = await request(`http://146.185.154.90:8080/restcountries/rest/v2/name/${value}`);
	const weather = await request(`https://wttr.in/${countries[0].capital}?format=j1`);
	const weatherData = weather.current_condition[0];
	const receivedData = [`Столица: ${countries[0].capital},`, `Температура в цельсиях: ${weatherData.temp_C} C°,`, `Направление ветра: ${weatherData.winddir16Point},`, `Скорость ветра: ${weatherData.windspeedKmph} км/ч,`, `Описание погоды: ${weatherData.weatherDesc[0].value}.`];
	const paragraph = document.createElement('div');
	const ul = document.createElement('ul');
	const span = document.createElement('span');
	paragraph.classList.add('info__paragraph');
	ul.classList.add('info__ul');
	counter++;
	if (counter === 1) {
		ul.append(`Искомая страна: ${countries[0].name}`);
		paragraph.style.background = 'yellow';
		paragraph.style.color = 'black';
	}
	else {
		ul.append(`${counter - 1}-ая граничащая страна: ${countries[0].name}`);
	};
	for (let i = 0; i < receivedData.length; i++) {
		const list = document.createElement('li');
		list.classList.add('info__li');
		addFn(list, ul, receivedData[i]);
		ul.append(list);
	};
	addFn(paragraph, infoContainer, ul);
	if (counter === 1 && (countries[0].borders).length === 0) {
		addFn(span, noBorderCountry, `Граничащих стран нет.`);
		infoContainer.append(noBorderCountry);
	};
	return countries[0].borders;
}

form.addEventListener('submit', (e) => {
	e.preventDefault();
	loader.style.display = 'block';
	infoContainer.innerHTML = '';
	counter = 0;
	run();
})