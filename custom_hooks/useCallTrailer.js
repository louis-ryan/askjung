const useCallTrailer = (setYoutubeID) => {

    async function callTrailer(query) {

        try {
            const response = await fetch(`/api/trailer?query=${query} official trailer`);
            const data = await response.json();

            if (response.status !== 200) { throw data.error || new Error(`Request failed with status ${response.status}`) }

            const idFromSearch = data.items[0].id.videoId

            setYoutubeID(idFromSearch)

        } catch (error) {
            console.error("trailer error: ", error);
        }
    }

    return {
        callTrailer: callTrailer
    }
}

export default useCallTrailer;