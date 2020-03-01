import React, { useState, useEffect } from 'react';
import { uniqBy } from 'lodash';
import './App.css';

const axios = require('axios').default;
axios.defaults.headers.common['x-rapidapi-host'] =
  'cometari-airportsfinder-v1.p.rapidapi.com';
axios.defaults.headers.common['x-rapidapi-key'] =
  'aae212215dmsh0aeb91f7306b2ddp1f8d34jsn2baf847ae58d';

const airportsApiPath =
  'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/';

const getAirports = async () => {
  const url = new URL(
    'by-radius?radius=6000&lng=57.915054&lat=56.010555',
    airportsApiPath
  );
  const response = await axios.get(url);
  const airports = response.data;
  return airports;
};

const searchAirportsByName = async pattern => {
  const url = new URL(`by-text?text=${pattern}`, airportsApiPath);
  const response = await axios.get(url);
  const findedAirports = response.data;
  return findedAirports;
};

const searchAirportsByCode = async pattern => {
  const url = new URL(`by-code?code=${pattern}`, airportsApiPath);
  const response = await axios.get(url);
  const findedAirports = response.data;
  return findedAirports;
};

function App() {
  const [airports, setAirports] = useState([
    {
      airportId: '0053ec86-326c-433a-a49e-3679865faddb',
      code: 'QAR',
      name: 'Deelen Air Base Airport',
      location: { longitude: 5.898729599999999, latitude: 51.9851034 },
      cityId: '21e65a1a-9170-4230-868f-58a70873e8a1',
      city: 'Arnhem',
      countryCode: 'NL',
      themes: [],
      pointsOfSale: ['NL'],
    },
  ]);
  const [filteredAirports, setFilteredAirports] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAirports = async () => {
      setLoading(true);
      try {
        const fetchedAirports = await getAirports();
        setLoading(false);
        setAirports(fetchedAirports);
        setFilteredAirports(fetchedAirports);
      } catch (e) {
        setLoading(false);
        console.log('fetchAirports: ' + e.message.toString());
      }
    };
    fetchAirports();
  }, []);

  const [searchInput, setSearchInput] = useState('');
  const [searchPattern, setSearchPattern] = useState('');

  const handleSearchInputChange = event => {
    const { value } = event.target;
    setSearchInput(value);

    const normalizedValue = value.toLowerCase().trim();
    setSearchPattern(normalizedValue);
  };

  useEffect(() => {
    const localFinded = airports.filter(
      ({ name, code }) =>
        name.toLowerCase().includes(searchPattern) ||
        code.toLowerCase().includes(searchPattern)
    );

    if (localFinded.length > 0) {
      setFilteredAirports(localFinded);
    } else {
      const searchByCodeAndName = async pattern => {
        try {
          const findedByCode = await searchAirportsByCode(pattern);
          const findedByName = await searchAirportsByName(pattern);
          const allFinded = uniqBy(
            [...findedByCode, ...findedByName],
            'airportId'
          );
          if (allFinded.length > 0) {
            setFilteredAirports(allFinded);
            // feature for reduce requests
            setAirports([...airports, ...allFinded]);
          }
        } catch (e) {
          console.log('searchByCodeAndName: ' + e.message.toString());
        }
      };
      searchByCodeAndName(searchPattern);
    }
  }, [airports, searchPattern]);

  if (loading) {
    return 'Loading...';
  }

  return (
    <main>
      <div className='inputBox'>
        <label htmlFor='airportsSearch' className='searchLabel'>
          Search:
        </label>
        <input
          id='airportsSearch'
          className='searchInput'
          placeholder='Please enter airport name or code'
          value={searchInput}
          onChange={handleSearchInputChange}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Name (Code)</th>
            <th>Lat & Lng</th>
          </tr>
        </thead>
        <tbody>
          {filteredAirports.map(({ name, code, location, airportId }) => {
            const nameWithCode = `${name} (${code})`;
            const { longitude, latitude } = location;
            return (
              <tr key={airportId}>
                <td>{nameWithCode}</td>
                <td>
                  {latitude} {longitude}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

export default App;
