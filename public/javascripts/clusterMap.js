maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'cluster-map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: [-103.59179687498357, 40.66995747013945],
    zoom: 3
});

map.on('load', function () {
    map.addSource('campgrounds', {
        type: 'geojson',
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 45
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                10,
                '#2196F3',
                30,
                '#1a237e'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                10,
                25,
                30,
                35
            ],
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
            'circle-stroke-opacity': 0.5
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14,
            'text-allow-overlap': true
        },
        paint: {
            'text-color': '#ffffff'
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#51bbd6',
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.9
        }
    });

    // Show popup on cluster hover
    map.on('mouseenter', 'clusters', async (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        const pointCount = features[0].properties.point_count;
        const clusterSource = map.getSource('campgrounds');
        
        // Get clustered points
        const clusterLeaves = await clusterSource.getClusterLeaves(
            clusterId,
            Math.min(pointCount, 5), // Get up to 5 campgrounds
            0
        );

        // Create popup content
        const coordinates = features[0].geometry.coordinates.slice();
        const plural = pointCount === 1 ? 'campground' : 'campgrounds';
        let description = `<strong>${pointCount} ${plural}</strong><br>`;
        
        // Add links to the first 5 campgrounds
        description += '<div style="max-height: 150px; overflow-y: auto;">';
        clusterLeaves.forEach(leaf => {
            const title = leaf.properties.title;
            const id = leaf.properties._id;
            description += `<a href="/campgrounds/${id}" style="display: block; margin: 5px 0; color: #007bff; text-decoration: none;">${title}</a>`;
        });
        if (pointCount > 5) {
            description += `<small class="text-muted">...and ${pointCount - 5} more</small>`;
        }
        description += '</div>';
        description += '<small class="text-muted"><br>Click cluster to zoom in</small>';
        
        new maptilersdk.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
        const popups = document.getElementsByClassName('maplibregl-popup');
        if (popups[0]) popups[0].remove();
    });

    // inspect a cluster on click
    map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        const zoom = await map.getSource('campgrounds').getClusterExpansionZoom(clusterId);
        map.easeTo({
            center: features[0].geometry.coordinates,
            zoom,
            duration: 500
        });
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', function (e) {
        const { popUpMarkup } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maptilersdk.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpMarkup)
            .addTo(map);
    });

    map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
    });
});