const ACCESS_TOKEN='pk.eyJ1Ijoia2FnYW5iZXJrIiwiYSI6ImNsZTJ6ZDB5aTAzdzgzcGw2cTlnbGhnemoifQ.GRxZGw8vJphgo_6u-6zepA'

const map = L.map('map').setView([41.052856, 28.90], 9);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let geojson = L.geoJson(istanbulDistricts, {
    style,
    onEachFeature
}).addTo(map);


	// control that shows state info on hover
	const info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (props) {
		const contents = props ? `<b>${props.name??props.address.city??props.address.village}</b><br />${props.density} people / mi<sup>2</sup>` : 'İlçe üzerine imleci getiriniz';
		this._div.innerHTML = `<h4>İstanbul Deplem Riski haritası</h4>${contents}`;
	};

	info.addTo(map);


	// get color depending on population density value
	function getColor(d) {
		return d > 1000 ? '#800026' :
			d > 500  ? '#BD0026' :
			d > 200  ? '#E31A1C' :
			d > 100  ? '#FC4E2A' :
			d > 50   ? '#FD8D3C' :
			d > 20   ? '#FEB24C' :
			d > 10   ? '#FED976' : '#FFEDA0';
	}

	function style(feature) {
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.density)
		};
	}

	function highlightFeature(e) {
		const layer = e.target;
		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '3',
			fillOpacity: 0.7
		});

		layer.bringToFront();
		info.update(layer.feature.properties);
	}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    console.log(e.target)
    info.update();
}

function zoomToFeature(e) {
    console.log(e)
    map.fitBounds(e.target.getBounds());

}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


const legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 10, 20, 50, 100, 200, 500, 1000];
    const labels = [];
    let from, to;

    for (let i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(`
        <div style="display:flex;flex-direction:row;width:120px;height:10px;align-items:center" >
            <div style="width:20px;height:20px;background:${getColor(from + 1)};margin-right:8px"></div> <span>${from}${to ? `&ndash;${to}` : '+'}</span>
        </div>
        `);
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);

var prevZoom = map.getZoom();
    
map.on('zoomend',function(e){
	var currZoom = map.getZoom();
    var diff = prevZoom - currZoom;
    geojson.clearLayers();

    if(diff > 0 && currZoom<=10){
        geojson = L.geoJson(istanbulDistricts, {
            style,
            onEachFeature
        }).addTo(map);
        
    } else if(diff < 0 && currZoom>10) {
        geojson = L.geoJson(mahalle, {
            style,
            onEachFeature,
            filter:filterByMahalle

        }).addTo(map);
    } else{
        geojson = L.geoJson(mahalle, {
            style,
            onEachFeature,
            filter:filterByMahalle
        }).addTo(map);
    }
    prevZoom = currZoom;
});


function filterByMahalle(feature) {
    console.log(feature)
    if (feature.properties.address.town === "Sancaktepe") return true
    //return true;
  }