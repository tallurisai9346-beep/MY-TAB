# MY TABS
Space Pulse is a custom new tab page built with the NASA Astronomy Picture of the Day API. Space Pulse gives a new tab more functionality while being more fun and engaging than a normal new tab. It has a search bar, quick links, sticky notes, and an emoji profile.

## Motivation
I wanted to build this new tab page because I wanted something that was more engaging for a new tab but didn't sacrifice the beauty of a default new tab

## Preview


<img width="1451" height="885" alt="Screenshot 2026-08-28 121002" src="https://github.com/user-attachments/assets/18b2640d-ef22-4ef9-82f9-16aba99c9781" />
<img width="1563" height="877" alt="Screenshot 2026-08-28 121025" src="https://github.com/user-attachments/assets/de1a395e-8861-4542-b7e4-47a36cab747e" />
<img width="1335" height="852" alt="Screenshot 2026-08-28 121111" src="https://github.com/user-attachments/assets/e991f56d-429e-4ecd-a7cb-9a3de1b8cdd2" />

# Features
> NASA APOD

Search bar

Quick links

Sticky notes

Current time/date and greeting

Emoji profile

Search Engines
The search bar can be changed to any search engine by changing the search engine in main.js. The default search bar is set to Google but can be changed to other search engines as well. The following are the search engine links below:


| Search Engine | Link                                 |
| ------------- | ------------------------------------ |
| Google        | `https://www.google.com/search?q=`   |
| DuckDuckGo    | `https://duckduckgo.com/?q=`         |
| Bing          | `https://www.bing.com/search?q=`     |
| Yahoo         | `https://search.yahoo.com/search?p=` |
| Brave Search  | `https://search.brave.com/search?q=` |

## NASA APOD

The background of the new tab comes from NASA's Astronomy Picture of the Day API.

Every day, NASA provides a new space-related picture or video. If the APOD is a video, the page uses a default background image instead.

## Search

The search bar lets you search the web directly from the new tab. You can choose which search engine you want to use by changing the URL in `main.js`.

## Quick Links

Quick links are there for websites that I use often. Users can add the links they want so they can access them quickly from the new tab.

## Sticky Notes

The sticky notes feature lets users create simple notes directly on the new tab.

You can:

* Add notes
* Edit notes
* Check notes off
* Delete notes

The notes are saved in the browser, so they stay there when the page is opened again.

## Emoji Profile

When the page is opened for the first time, users can choose an emoji for their profile.

The selected emoji is saved using `localStorage`, so it doesn't need to be selected again every time the tab is opened.

## Technologies Used

* HTML
* CSS
* JavaScript
* Vite
* NASA APOD API
* localStorage

## How To Run

First, clone the repository and install the dependencies:

```bash
npm install
```

Then create a `.env` file in the root of the project and add your NASA API key:

```env
VITE_NASA_API_KEY=your_api_key_here
```

After that, start the development server:

```bash
npm run dev
```

## Project Structure

```text
src/
main.js
style.css
index.html
```

## What I Learned

While making this project, I learned more about:

* Using APIs
* Working with `localStorage`
* Building a custom new tab page
* Using JavaScript to make the page interactive
* Working with Vite

## Future Plans

There are a few things I would like to add in the future:

* Pomodoro timer
* More options for sticky notes
* Weather
* Custom themes
* More options for quick links

## Credits

* NASA for the Astronomy Picture of the Day API
* Hack Club Stardance for the challenge
* My friends for testing the new tab page

## License

This project is open source and is licensed under the MIT License. See the `LICENSE` file for more information.
