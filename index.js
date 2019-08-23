// -------- DATE UTILS --------- //
const LAST_DAY_OF_MONTH = {
    1: 31,
    2: 28, // For simplicity, let's not worry about leap years
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31
}

function isDateEqual(a, b) {
    return a.day === b.day && a.month === b.month && a.year === b.year;
}

function dateNumToString(x) {
    if (x < 10) {
        return "0"+x.toString();
    } else {
        return x.toString();
    }
}

function getPrevDay(date) {
    const day = parseInt(date.day, 10);
    const month = parseInt(date.month, 10);
    const year = parseInt(date.year, 10);

    if (day > 1) {
        // not at first day, so just subtract a day
        return Object.assign({}, date, { day: dateNumToString(day-1) });
    } else if (month > 1) {
        // were at the first day.
        // but not at first month, so just go to first day of prev month
        const prevMonth = dateNumToString(month - 1);
        return {
            month: prevMonth,
            day: dateNumToString(LAST_DAY_OF_MONTH[prevMonth]),
            year: date.year
        };
    } else {
        // we're on january 1st
        return {
            month: "12",
            day: "31",
            year: (year - 1).toString()
        };
    }
}

function getLastBirthdayYear(monthNum, dayNum) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();

    if (
            monthNum < currentMonth ||
            (monthNum === currentMonth && dayNum <= currentDay)
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
            year:getLastBirthdayYear(parseInt(month, 10), parseInt(day, 10)).toString()
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

// -------- NASA API UTILS --------- //

const API_KEY = "yJtTgrBhiO9zcxu1wL1YF92duSZBIwIHxjStNdrm";

function getImageUrl(imageMeta) {
    const date = parseImageDate(imageMeta.date);
    return `https://api.nasa.gov/EPIC/archive/natural/${date.year}/${date.month}/${date.day}/png/${imageMeta.image}.png?api_key=${API_KEY}`;
}   

function getImagesMetaUrl(date) {
    return `https://api.nasa.gov/EPIC/api/natural/date/${date.year}-${date.month}-${date.day}?api_key=${API_KEY}`;
}   


// -------- COMPONENTS --------- //
class Images {
    constructor(containerEl, imageUrls) {
        this.containerEl = containerEl;
        this.imageUrls = imageUrls;
        this.index = 0;

        // Clear container
        while (this.containerEl.firstChild)
            this.containerEl.removeChild(this.containerEl.firstChild);

        // Add images
        for (const imageUrl of this.imageUrls) {
            const imageEl = document.createElement("img");
            imageEl.classList.add("earth");
            imageEl.src = imageUrl;
            imageEl.setAttribute("width", 500);
            imageEl.setAttribute("height", 500);
            this.containerEl.appendChild(imageEl);
        }

        // Set up slider if more than one image
        if (this.imageUrls.length > 1) {
            const slider = document.createElement("input");
            slider.setAttribute("id", "imageSlider");
            slider.setAttribute("type", "range");
            slider.setAttribute("min", 0);
            slider.setAttribute("max", this.imageUrls.length-1);
            slider.setAttribute("step", 1);
            slider.setAttribute("value", 0);
            slider.addEventListener("change", event=>{
                this.index = parseInt(slider.value, 10);
                this.render();
            });
            this.containerEl.appendChild(slider);
        }

        this.render();
    }

    render() {
        // only show image at index
        this.containerEl.querySelectorAll("img.earth").forEach((img, index)=>{
            if (index === this.index) {
                img.classList.remove("hidden");
            } else {
                img.classList.add("hidden");
            }
        });
    }
}

class BearthdayUI {
    constructor(rootEl) {
        this.rootEl = rootEl;
        this.imageUrls = [];
        this.imageUrlsDate = null;
        this.birthdayDate = null;
        this.isLoading = false;
        this.parseError = false;

        this.rootEl.querySelector("#queryForm").addEventListener("submit", (event)=>{
            event.preventDefault();

            this.submitBirthday(rootEl.querySelector("#birthday").value);
        });

        this.render();
    }

    submitBirthday(input) {
        this.imageUrls = [];
        this.imageUrlsDate = null;

        const date = parseBirthday(input);
        if (date) {
            this.birthdayDate = date;
            this.parseError = false;
            this.isLoading = true;


            this.fetchImageUrls(date, (urls, imageUrlsDate)=>{
                this.imageUrls = urls;
                this.isLoading = false;
                this.imageUrlsDate = imageUrlsDate;

                this.render();
            });
        } else {
            this.parseError = true;
            this.birthdayDate = null;
            this.imageUrlsDate = null;
        }

        this.render();
    }

    fetchImageUrls(date, callback) {
        // Fetch images for given birthday
        // If there are none, then try again with the previous day
        var imagesMetaUrl = getImagesMetaUrl(date);
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = ()=>{
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                const imagesMeta = JSON.parse(xmlHttp.responseText);

                if (imagesMeta.length === 0) {
                    // no images for this day, so try again with previous day
                    const prevDay = getPrevDay(date);
                    this.fetchImageUrls(prevDay, callback);
                } else {
                    const imageUrls = imagesMeta.map(getImageUrl);
                    callback(imageUrls, date);
                }
            }
        }
        xmlHttp.open("GET", imagesMetaUrl, true);
        xmlHttp.send(null);
    }

    render(){
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

        // Set b-earth-day banner text
        let bannerText = "";
        if (this.imageUrlsDate && this.birthdayDate && isDateEqual(this.imageUrlsDate, this.birthdayDate)) {
            bannerText = "TRUE B-EARTH-DAY IMAGE!";
        } else if (this.imageUrlsDate) {
            bannerText = `Couldn't find images from your most recent birthday. `+
                        `Images are from closest available: ${this.imageUrlsDate.month}/${this.imageUrlsDate.day}/${this.imageUrlsDate.year}`;
        }
        this.rootEl.querySelector("#bearthdayBanner").textContent = bannerText;

        const imagesComponent = new Images(this.rootEl.querySelector("#images"), this.imageUrls);
    }
}

// -------- INITIALIZE APP --------- //

var component = new BearthdayUI(document.getElementById("app"));
