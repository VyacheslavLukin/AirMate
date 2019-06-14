// import {_onViewportChange} from '../App';
import {FlyToInterpolator} from 'react-map-gl';

export const addCountiesLayer = (map) => {
    map.addSource('countries', {
        'type': 'geojson',
        'data': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson'
    });

    // Add a layer showing the state polygons.
    map.addLayer({
        'id': 'countries-layer',
        'type': 'fill',
        'source': 'countries', 
        'maxzoom': 5,
        'paint': {
            'fill-color': 'rgba(200, 100, 240, 0.4)',
            'fill-outline-color': 'rgba(200, 100, 240, 1)'
        }
    });
}

export const _goToViewport = (longitude, latitude) => {
    _onViewportChange({
      longitude, 
      latitude,
      zoom: 11,
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 3000
    });
  };

export const _onHover = (event) => {
    let countyName = '';
    let hoverInfo = null;

    const feature = event.features && event.features.find(f => f.layer.id === 'counties');
    // const map = _getMap();
    // map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
};

export const _getCursor = ({isHovering, isDragging}) => {
    return isHovering ? 'pointer' : 'default';
  };