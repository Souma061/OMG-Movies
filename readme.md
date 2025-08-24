# OMG Movie 🎬

OMG Movie is a modern, responsive web application for searching movies, viewing details, and managing your favorites. It uses the OMDb API to fetch movie data and provides a smooth, interactive user experience with features like dark/light theme toggle, top picks, and persistent favorites.

## Features

- **Movie Search:** Search for movies by name using the OMDb API.
- **Movie Details:** View detailed information about each movie, including poster, year, genre, rating, and plot.
- **Favorites:** Add or remove movies from your favorites list. Favorites are saved in your browser's local storage.
- **Top Picks:** See a curated list of classic and popular movies.
- **Theme Toggle:** Switch between dark and light themes. Your preference is saved.
- **Responsive Design:** Works well on desktop and mobile devices.
- **Pagination:** Browse through multiple pages of search results.
- **Accessible UI:** Keyboard navigation and ARIA labels for better accessibility.

## How It Works

- **Home Page (`index.html`):**
	- Search for movies using the search bar.
	- Browse results, add movies to favorites, or view details.
	- See Top Picks and manage your favorites list.
	- Toggle between dark and light themes.

- **Details Page (`details.html`):**
	- View detailed information about a selected movie.
	- Return to the main page easily.

## Technologies Used

- HTML5, CSS3, JavaScript (Vanilla)
- Bootstrap 5 for UI components and layout
- OMDb API for movie data

## Getting Started

1. Clone this repository:
	 ```sh
	 git clone https://github.com/Souma061/OMG-Movies.git
	 ```
2. Open `index.html` in your browser to use the app locally.

## Customization
- You can change the OMDb API key in `script.js` if needed.
- Update the Top Picks list in `script.js` to feature your favorite movies.

## License
This project is for educational and personal use.
