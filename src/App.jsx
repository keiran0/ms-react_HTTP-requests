import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import Error from './components/Error.jsx';
import AvailablePlaces from './components/AvailablePlaces.jsx';

import { fetchUserPlaces, updateUserPlaces } from './http.js';

function App() {
  const selectedPlace = useRef();
  const [userPlaces, setUserPlaces] = useState([]);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState();

  useEffect(()=>{
    async function fetchPlaces(){
      setIsFetching(true);
      try {
        const places = await fetchUserPlaces();
        setUserPlaces(places)
      } catch (error) {
        setError({message: error.message || "failed to fetch user places"})
      }
      setIsFetching(false);
    }
    fetchPlaces();
  }, [])


  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updateUserPlaces([selectedPlace,...userPlaces])
    } catch (error) {
      setUserPlaces(userPlaces) //'rolling back' the changes if there is an error. The above acts on optimistic updating, where the UI updates before the update to the backend. 
      setErrorUpdatingPlaces({message:error.message || "Failed to update places"})
    }

  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );
    try {
      await updateUserPlaces(userPlaces.filter(place=>place.id!== selectedPlace.current.id))

    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({message: error.message || 'failed to delete page'})
    }
    
    setModalIsOpen(false);
  }, [userPlaces]);

  function handleError(){
    setErrorUpdatingPlaces(null)
  }

  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={handleError}>
        {errorUpdatingPlaces && <Error message={errorUpdatingPlaces.message} title="An error occurred!" onConfirm={handleError}/>}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="an error occurred!" message={error.message}/>}
        {!error && <Places
          title="I'd like to visit ..."
          isLoading={isFetching}
          loadingText="Fetching your places..."
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
