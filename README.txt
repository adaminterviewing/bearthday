To use:

Open index.html in a browser.


Comments:

- I decided to go with Vanilla JS, in one file, because it's small enough for now, and because I didn't want to get into setting up a React/Babel/Webpack development environment. I tried using ES6 imports in the browser and it didn't seem to work. I organized the code into sections that would be split into files, to show code organization. I would definitely do it with React/Webpack/Babel for a real project, because it's key for maintainability and scalability.

- Another cool UI thing would be to add labels to the range slider, on the left is the time of the earliest image, on the right is the time of the latest image.

- I changed the spec to return an image from the closest date *before* instead of after, because there's no guarantee of finding a closest date after, if their birthday is today and there's no image today.

- I decided not to add tests due to time constraints, but I can summarize what I would test:
	> Unit test the date logic, on standard cases and edge cases (e.g. first day of month, first day of year, current day, tomorrow, yesterday)
	> Unit test the birthday parsing, simple tests making sure the regex does what its supposed to
	> Test the Images class with a document fragment as the containerEl, and dummy imageUrls, to see whether it gives the right output.
		Test it with no image urls, 1 image url, 2 image urls, 5 image urls.
	> Stub the BearthdayUI::fetchImageUrls method and make sure it's called with the correct argument when the user clicks submit
	> End-to-end screenshot tests while stubbing the getImageUrl method to pick a specific image or set of images in our test assets.