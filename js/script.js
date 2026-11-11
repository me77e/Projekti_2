// API key 
const kaupunkiLista = document.getElementById("kaupunki");
const omaKaupunki = document.getElementById("omaKaupunki");
const form = document.querySelector("form");
const paivamaaraInput = document.getElementById("paivamaara");
const saaennuste = document.getElementById("saaennuste");

// Oma API-avain
const API_KEY = "e3e9413d8f840e4565cd8ebb83e7f823";

// Valmiin kaupungin valinta pudotusvalikosta
kaupunkiLista.addEventListener("change", function() {
    omaKaupunki.value = "";
});

// Käyttäjä hakee itse haluamansa kaupungin sääennusteen

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const paivamaara = paivamaaraInput.value;
    let kaupunki = "";

    if (paivamaara === "") {
        saaennuste.textContent = "Syötä ensin päivämäärä.";
        return;
    }

    if (omaKaupunki.value !== "") {
        kaupunki = omaKaupunki.value;
    } else {
        kaupunki = kaupunkiLista.value;
    }

    if (kaupunki === "") {
        saaennuste.textContent = "Valitse tai kirjoita kaupunki.";
        return;
    }

    haetaan_saa(kaupunki, paivamaara);
});


//haetaan kaupunki ja sen koordinaatit openweathermapista tai annetaan virheilmoitus

async function haetaan_saa(kaupunki, paivamaara) {
    try {

        const coordinatesUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(kaupunki)}&limit=1&appid=${API_KEY}`;

        const coordinatesResponse = await fetch (coordinatesUrl);
        const coordinatesData = await coordinatesResponse.json();

        if(!coordinatesResponse.ok) {
             throw new Error("Haku epäonnistui.");

        }

        if (coordinatesData.length === 0) {
        saaennuste.textContent = "Kaupunkia ei löytynyt.";
        return;
        }
        const lat = coordinatesData[0].lat;
        const lon = coordinatesData[0].lon;

//haetaan koordinaattien perusteella sääennuste

        const ennusteUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fi&appid=${API_KEY}`;

        const saaennusteResponse = await fetch(ennusteUrl);
        const saaennusteData = await saaennusteResponse.json();
        if (!saaennusteResponse.ok) {
            throw new Error("Sääennusteen hakeminen epäonnistui.");
        }

// Suodatetaan valitun päivän ennusteet
        const paivanSaa = saaennusteData.list.filter(item => {
            const paivamaaraAPI = item.dt_txt.slice(0, 10);

            return paivamaaraAPI === paivamaara;
        });

        if (paivanSaa.length === 0) {
            saaennuste.textContent = "Valitulle päivälle ei löytynyt ennustetta.";
            return;
        }

        // Näytetään sääennuste
        naytaSaa(paivanSaa, coordinatesData[0].name);

    } catch (error) {
        saaennuste.textContent = "Virhe: " + error.message;
    }
}


function naytaSaa(paivanSaa, kaupunki) {
    saaennuste.innerHTML = `<h2>Sääennuste: ${kaupunki}</h2>`;

    paivanSaa.forEach(item => {
        saaennuste.innerHTML += `
            <div>
                <h3>${item.dt_txt}</h3>
                <p>Lämpötila: ${item.main.temp.toFixed(1)} °C</p>
                <p>Sää: ${item.weather[0].description}</p>
                <p>Tuuli: ${item.wind.speed.toFixed(1)} m/s</p>
                <p>Ilmankosteus: ${item.main.humidity} %</p>
            </div>
        `;
    });
}






