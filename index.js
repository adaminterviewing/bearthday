const API_KEY = "yJtTgrBhiO9zcxu1wL1YF92duSZBIwIHxjStNdrm";

function getLastBirthdayYear(monthNum, dayNum) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();

    if (
            currentMonth < monthNum ||
            (currentMonth === monthNum && currentDay <= dayNum)
        ) {
        return currentYear;
    } else {
        return currentYear - 1;
    }
}

function parseBirthday(input) {
    const matchResult = input.match(/(\d\d)\/(\d\d)/);
    if (matchResult) {
        const month = matchResult[1];
        const day = matchResult[2];
        return {
            month:month,
            day:day,
            year:getLastBirthdayYear(parseInt(month, 10), parseInt(day, 10))
        };
    } else {
        return null;
    }
}

function parseImageDate(imageTimestamp) {
    const matchResult = imageTimestamp.match(/(\d\d\d\d)-(\d\d)-(\d\d)/);
    return {
        month:matchResult[2],
        day:matchResult[3],
        year:matchResult[1]
    };
}

function getImageUrl(imageMeta) {
    const date = parseImageDate(imageMeta.date);
    return `https://api.nasa.gov/EPIC/archive/natural/${date.year}/${date.month}/${date.day}/png/${imageMeta.image}.png?api_key=${API_KEY}`;
}   

class BearthdayUI {
    constructor(rootEl) {
        this.rootEl = rootEl;
        this.imageUrl = null;
        this.isLoading = false;
        this.parseError = false;

        this.rootEl.querySelector("#submit").addEventListener("click", ()=>{
            this.submitBirthday(rootEl.querySelector("#birthday").value);
        });

        this.render();
    }

    submitBirthday(input) {
        const date = parseBirthday(input);

        if (date) {
            this.parseError = false;
            this.isLoading = true;

            // fetch most recent images for date
            var imagesUrl = `https://api.nasa.gov/EPIC/api/natural/date/${date.year}-${date.month}-${date.day}?api_key=${API_KEY}`;
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = ()=>{
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    const imagesMeta = JSON.parse(xmlHttp.responseText);
                    if (imagesMeta.length > 0) {
                        this.imageUrl = getImageUrl(imagesMeta[0]);
                    }

                    this.isLoading = false;
                    this.render();
                }
            }
            xmlHttp.open("GET", imagesUrl, true);
            xmlHttp.send(null);
        } else {
            this.parseError = true;
            this.imageUrl = null;
        }

        this.render();
    }

    render(){
        // Clear images area
        const imagesArea = this.rootEl.querySelector("#images");
        while (imagesArea.firstChild)
            imagesArea.removeChild(imagesArea.firstChild);

        // If loading, show loading message, and disable submit button
        if (this.isLoading) {
            this.rootEl.querySelector("#loading").classList.remove("hidden");
            this.rootEl.querySelector("#submit").setAttribute("disabled", true);
        } else {
            this.rootEl.querySelector("#loading").classList.add("hidden");
            this.rootEl.querySelector("#submit").removeAttribute("disabled");
        }

        // If error, show error message
        if (this.parseError) {
            this.rootEl.querySelector("#error").classList.remove("hidden");
        } else {
            this.rootEl.querySelector("#error").classList.add("hidden");
        }

        // If we have an image, display it
        if (this.imageUrl) {
            const imageEl = document.createElement("img");
            imageEl.classList.add("earth");
            imageEl.src = this.imageUrl;
            imageEl.setAttribute("width", 500);
            imageEl.setAttribute("height", 500);
            imagesArea.appendChild(imageEl);
        }   
    }
}


var component = new BearthdayUI(document.getElementById("app"));