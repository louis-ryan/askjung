const useScreener = (movieOneStr, movieTwoStr, movieThreeStr, toBeExcluded, setResult, callTrailer, screenDirector, directorOne, directorTwo, directorThree) => {

    async function callForScreener() {
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    movieOne: movieOneStr,
                    movieTwo: movieTwoStr,
                    movieThree: movieThreeStr,
                    toBeExcluded: toBeExcluded
                }),
            });
            const data = await response.json();
            if (response.status !== 200) { throw data.error || new Error(`Request failed with status ${response.status}`); }
            screenResult(data.result)
        } catch (error) {
            console.error("screener call err: ", error);
        }
    }


    function excludeRepeats(strTitle) {

        toBeExcluded.forEach((movie) => {

            const movieArr = movie.split(' (')
            const excludedTitle = movieArr[0].toLowerCase()
            const thisTitle = strTitle.toLowerCase()

            if (thisTitle.includes(excludedTitle)) {
                callForScreener()
            }
        })
    }


    function screenResult(movieStr) {

        const [strTitle, strYear, strDirector] = movieStr.split('; ')
        const resultStr = `${strTitle} (${strYear}) directed by ${strDirector}`

        excludeRepeats(strTitle)

        if (screenDirector === false) {
            setResult(resultStr);
            callTrailer(movieStr);
            return
        }

        const sameDirectorAsSearch = (strDirector.toLowerCase() === directorOne || strDirector.toLowerCase() === directorTwo || strDirector.toLowerCase() === directorThree)

        if (sameDirectorAsSearch) {
            callForScreener()
        } else {
            setResult(resultStr);
            callTrailer(movieStr);
        }
    }

    return {
        screenResult: screenResult
    }
}

export default useScreener;