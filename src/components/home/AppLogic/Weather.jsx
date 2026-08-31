import { WindIcon } from "@phosphor-icons/react";
import { useState } from "react";

export default function Weather() {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    const fetchWeather = async (e) => {
        e.preventDefault();

        if (!city.trim()) {
            setError("Please enter a city name.");
            return;
        }

        setLoading(true);
        setError("");
        setWeather(null);
        setCity("")

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
            );

            if (!response.ok) {
                throw new Error("City not found");
            }

            const data = await response.json();

            setWeather(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="bg-white w-full h-full rounded-lg flex flex-col justify-center items-center overflow-scroll relative"
            style={{
                backgroundImage: `url(good-weather-4.jpg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "16px",
            }}>
            <div class="absolute inset-0 bg-black/20 backdrop-blur-xs flex flex-col items-center justify-center border border-pink-100 rounded-xl">
                <div>
                    <form onSubmit={fetchWeather} className="flex gap-3 border border-white rounded-2xl bg-black/10">
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Enter city"
                            className="px-4 py-2 outline-0 w-full text-white font-semibold text-sm"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className=" bg-[#f8f1ae] text-black/70 font-bold px-2 py-1 rounded-2xl text-sm">
                            {loading ? "Loading.." : "Search"}
                        </button>
                    </form>

                    {error && <p className="mt-4 text-red-500">{error}</p>}

                    {weather && (
                        <div className="flex flex-col justify-center items-center mt-4 text-center bg-white/10 p-2 rounded-xl">
                            <img src="./cloudy.png" alt="weather" className="w-40" />

                            <div>
                                <h1 className="text-xl/7 font-bold text-white">
                                    {Math.round(weather.main.temp)}°C
                                </h1>
                                <p className="text-md/7 font-semibold text-white">
                                    {weather.weather[0].description}
                                </p>
                                <p className="text-sm/7 font-semibold text-white">
                                    {weather.name}, {weather.sys.country}
                                </p>

                                <div className="text-white text-xs/6">
                                    <p>
                                        Feels like: {Math.round(weather.main.feels_like)}°C
                                    </p>

                                    <div className="bg-black/60 px-2 py-1 rounded-4xl flex gap-3 items-center justify-center">
                                        <WindIcon size={26} />
                                        Wind: {weather.wind.speed} m/s
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
