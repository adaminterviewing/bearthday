To use:

Open index.html in a browser.


Comments:

- I decided to go with Vanilla JS, in one file, because it's small enough for now, and because I didn't want to get into setting up a React/Babel/Webpack development environment. I tried using ES6 imports in the browser and it didn't seem to work. I organized the code into sections that would be split into files, to show code organization. I would definitely do it with React/Webpack/Babel for a real project, because it's key for maintainability and scalability.

- Another cool UI thing would be to add labels to the range slider, on the left is the time of the earliest image, on the right is the time of the latest image.

- I changed the spec to return an image from the closest date *before* instead of after, because there's no guarantee of finding a closest date after, if their birthday is today and there's no image today.
