export async function fetchAvailablePlaces(){
    const response = await fetch('http://localhost:3000/places')
    const resData = await response.json()

    if (!response.ok) {
      throw new Error("failed to fetch places")
    }

    return resData.places
}

export async function fetchUserPlaces(){
    const response = await fetch('http://localhost:3000/user-places')
    const resData = await response.json()

    if (!response.ok) {
      throw new Error("failed to fetch user places")
    }

    return resData.places
}

export async function updateUserPlaces(places){
    const response = await fetch("http://localhost:3000/user-places", {
        method: 'PUT',
        body: JSON.stringify({places: places}), //or body: JSON.stringify({places}) since key and value have the same variable name
        headers: {
            'Content-Type': 'application/json' //required to make sure the data is extracted properly
        }
    })

    const resData = await response.json()

    if (!response.ok) {
        throw new Error("failed to update user data")
    }

    return resData.message

}