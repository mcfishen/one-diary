export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function weatherKeyFromCode(code, windspeed) {
  if (windspeed >= 30) return "wind";
  if (code === 0) return "sun";
  if ([1, 2, 3].includes(code)) return "cloud";
  if ([45, 48].includes(code)) return "fog";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return "rain";
  return "cloud";
}

export async function POST(request) {
  try {
    const { lat, lon } = await request.json();
    if (typeof lat !== "number" || typeof lon !== "number") {
      return Response.json({ error: "Нужны координаты." }, { status: 400 });
    }

    const [weatherRes, geoRes] = await Promise.allSettled([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`),
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=ru&zoom=16`,
        { headers: { "User-Agent": "one-diary-school-app (contact: ruslanfom2@gmail.com)" } }
      ),
    ]);

    let weather = "";
    if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
      const data = await weatherRes.value.json();
      const cw = data.current_weather;
      if (cw) weather = weatherKeyFromCode(cw.weathercode, cw.windspeed);
    }

    let location = "";
    if (geoRes.status === "fulfilled" && geoRes.value.ok) {
      const data = await geoRes.value.json();
      const a = data.address || {};
      const place = a.attraction || a.museum || a.building || a.tourism || a.suburb || a.neighbourhood;
      const city = a.city || a.town || a.village || a.municipality;
      location = [place, city].filter(Boolean).join(", ") ||
        (data.display_name ? data.display_name.split(",").slice(0, 2).join(",").trim() : "");
    }

    if (!location && !weather) {
      return Response.json({ error: "Не удалось определить место и погоду." }, { status: 502 });
    }

    return Response.json({ location, weather });
  } catch (e) {
    return Response.json({ error: e?.message || "Ошибка сервера." }, { status: 500 });
  }
}
