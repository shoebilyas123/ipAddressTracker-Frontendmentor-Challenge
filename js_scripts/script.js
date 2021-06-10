const map = document.querySelector("#map");
const mainBar = document.querySelector(".main_info_container");
const infoContainer = document.querySelector(".info_container");
const loaderSection = document.querySelector(".loader");
const loadDisplay = document.querySelector(".loader_text");
const displayIP = document.querySelector(".ip_info");
const displayLocation = document.querySelector(".loc_info");
const displayTimezone = document.querySelector(".timezone_info");
const displayISP = document.querySelector(".isp_info");
const inputIP = document.querySelector(".search_bar");
const formSearchISP = document.querySelector(".search_bar_container");
const errorContainer = document.querySelector(".error_display");
const errorText = document.querySelector(".error_text");

class ipTrackerApp {
  #myapiKey = `at_pzCmhLEXv18rQEcsCj8Ns2c4Lo0TI`;
  #errorColor = "#e74c3c";
  #zoomLevel = 14;
  #map;
  #marker;
  #waitForSeconds = 3;
  #options = {
    root: null,
    threshold: 0.55,
  };
  constructor() {
    const observer = new IntersectionObserver(
      this._hideNav.bind(this),
      this.#options
    );
    observer.observe(infoContainer);

    this._getUserIPAddressLocation(
      `https://geo.ipify.org/api/v1?apiKey=${this.#myapiKey}`
    );
    formSearchISP.addEventListener("submit", this._searchForIP.bind(this));
  }
  _hideNav(e) {
    if (!e[0].isIntersecting) {
      map.style.zIndex = "0";
      mainBar.classList.add("hidden");
    } else {
      map.style.zIndex = "-1";
      mainBar.classList.remove("hidden");
    }
  }
  _renderError(errMsg) {
    errorContainer.classList.remove("hide");
    errorText.textContent = `${errMsg}`;
    setTimeout(() => {
      errorContainer.style.opacity = "100";
      setTimeout(() => {
        errorContainer.style.opacity = "0";
        setTimeout(() => {
          errorContainer.classList.add("hide");
        }, 200);
      }, this.#waitForSeconds * 1000);
    }, 200);
  }

  _searchForIP(e) {
    e.preventDefault();
    const searchInput = inputIP.value;

    this._getJSON(
      `https://geo.ipify.org/api/v1?apiKey=${
        this.#myapiKey
      }&ipAddress=${searchInput}
    `,
      `Invalid IP Address`
    )
      .then((data) => {
        this._renderInformation(data);
        this._renderMapOnSearch(data.location, data.isp);
      })
      .catch((err) => {
        this._renderError(err.message);
      });
  }
  _getJSON(url, errMsg = "Something went wrong :(") {
    return fetch(url).then((response) => {
      if (!response.ok) throw new Error(`Error ${response.status} : ${errMsg}`);

      return response.json();
    });
  }
  _renderInformation(data) {
    displayIP.textContent = data.ip;
    displayLocation.textContent = `${data.location.city}, ${data.location.country} ${data.location.postalCode}`;
    displayISP.textContent = data.isp;
    displayTimezone.textContent = `UTC ${data.location.timezone}`;
  }
  _renderMapOnSearch(loc, ispName) {
    const { lat: latitude, lng: longitude } = loc;
    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup(
        `${ispName}'s Location : ${loc.city}, ${loc.country} ${loc.postalCode}`
      )
      .openPopup();

    this.#map.setView([latitude, longitude], this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _getUserIPAddressLocation(url) {
    this._getJSON(url, `Cannot find your location.`)
      .then((data) => {
        this._renderInformation(data);
        this._loadMap(data.location, data.isp);
      })
      .catch((err) => {
        this._renderError(err.message);
        this._getUserIPAddressLocation(
          `https://geo.ipify.org/api/v1?apiKey=${
            this.#myapiKey
          }&ipAddress=8.8.8.8`
        );
      })
      .finally(() => {
        loaderSection.classList.add("hide");
      });
  }
  // _getCoords() {}
  _loadMap(data, ispName) {
    const { lat: latitude, lng: longitude } = data;

    this.#map = L.map("map", {
      zoomControl: false,
      maxZoom: this.#zoomLevel,
      minZoom: this.#zoomLevel,
    }).setView([latitude, longitude], this.#zoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup(`${ispName}'s location : ${data.city}, ${data.country}`)
      .openPopup();
  }
}

const ipT = new ipTrackerApp();
