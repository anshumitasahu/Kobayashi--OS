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
        <div className="bg-white w-full h-full rounded-lg flex flex-col justify-center items-center overflow-scroll">
            <div>
                <form onSubmit={fetchWeather} className="flex gap-3">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city"
                        className="border border-[#8093f1] px-4 py-2 rounded-lg outline-0 w-full text-sm"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#8093f1] text-white font-bold px-2 py-1 rounded-lg text-sm">
                        {loading ? "Loading.." : "Search"}
                    </button>
                </form>

                {error && <p className="mt-4 text-red-500">{error}</p>}

                {weather && (
                    <div className="flex gap-5 items-center mt-4">
                        <img src="./weather4.png" alt="weather" className="w-50" />

                        <div>
                            <h1 className="text-xl/10 font-bold">
                                {weather.name}, {weather.sys.country}
                            </h1>

                            <div className="text-neutral-800 text-sm/6">
                                <h2>
                                    Temperature: {Math.round(weather.main.temp)}°C
                                </h2>

                                <p>
                                    Feels like: {Math.round(weather.main.feels_like)}°C
                                </p>

                                <p>
                                    Wind: {weather.wind.speed} m/s
                                </p>

                                <p>
                                    {weather.weather[0].description}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
