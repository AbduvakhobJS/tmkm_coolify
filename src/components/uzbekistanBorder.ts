export const uzbekistanBorder = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Uzbekistan"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [55.9289, 37.1449], [56.0, 37.9], [57.0, 38.3],
                    [57.8, 39.6], [58.5, 40.5], [59.4, 40.9],
                    [60.0, 41.4], [61.0, 41.5], [62.0, 42.2],
                    [63.5, 42.8], [65.5, 43.2], [67.5, 43.5],
                    [68.5, 43.3], [69.3, 43.0], [70.5, 42.8],
                    [71.5, 42.7], [72.5, 42.4], [73.0, 42.4],
                    [73.5, 42.0], [73.6, 41.5], [73.5, 40.5],
                    [73.0, 39.8], [72.5, 39.5], [71.5, 39.2],
                    [70.5, 39.5], [69.5, 40.0], [68.5, 40.2],
                    [67.7, 39.6], [66.5, 39.2], [66.0, 38.9],
                    [65.5, 38.3], [64.5, 37.9], [63.5, 37.6],
                    [62.5, 37.3], [61.0, 36.9], [60.0, 36.8],
                    [58.5, 37.0], [57.5, 37.2], [56.5, 37.0],
                    [55.9289, 37.1449]
                ]]
            }
        }
    ]
};


// src/data/uzbekistan-border.ts

export async function loadUzbekistanBorder() {
    try {
        const response = await fetch('/data/countries.geojson');
        const fullData = await response.json();

        const uzbekistan = fullData.features.find(
            (f: any) => {
                const name = f.properties.NAME || f.properties.ADMIN || f.properties.name || f.properties.name_en;
                return name === 'Uzbekistan';
            }
        );

        if (!uzbekistan) {
            console.error('Uzbekistan topilmadi!');
            return null;
        }

        return {
            type: 'FeatureCollection',
            features: [uzbekistan]
        };
    } catch (error) {
        console.error('GeoJSON yuklashda xatolik:', error);
        return null;
    }
}