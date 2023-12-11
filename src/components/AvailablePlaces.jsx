import { useState, useEffect } from 'react'

import Places from './Places.jsx';
import Error from './Error.jsx'

import { sortPlacesByDistance } from '../loc.js'
import { fetchAvailablePlaces } from '../http.js';

export default function AvailablePlaces({ onSelectPlace }) {

  const [availablePlaces, setAvailablePlaces] = useState([]) //Initial = empty list since the fetching of data is not instant. Render the component without the data, then update it when the data is available.
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState();

  // Note that async/await cannot be used on the React hook. However, since the async keyword is placed on a regular function (even if defined inside useEffect), this will work.

  useEffect(() => {
    async function fetchPlaces() {

      setIsFetching(true)
      try {
        
        const places = await fetchAvailablePlaces();

        navigator.geolocation.getCurrentPosition((position)=>{
          const sortedPlaces = sortPlacesByDistance(places, position.coords.latitude, position.coords.longitude)
          setAvailablePlaces(sortedPlaces)
          setIsFetching(false) //this function will only be called after getting the position data from the user. So this will be the last line that will run when the data is being fetched.
        });

      } catch (error) {
        setError({message: error.message || "Could not fetch places, please try again later."});
        setIsFetching(false)
      }
      

    }
    fetchPlaces();
  }, [])

  // OR this method
  // useEffect(() => { //preventing infinite loop of component execution + fetching
  //   fetch('http://localhost:3000/places')
  //     .then((response) => {
  //       return response.json()
  //     })
  //     .then((resData)=>{
  //       setAvailablePlaces(resData.places);
  //     });
  // }, []);

  if (error) {
    return(<Error title="An error occurred" message={error.message}/>)
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
      isLoading={isFetching}
      loadingText="Loading places.."
    />
  );
}
