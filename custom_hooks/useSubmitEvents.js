const useSubmitEvents = (movieOneStr, movieTwoStr, movieThreeStr, screenResult, toBeExcluded, setToBeExcluded, setView, setError, theLoveList, theHateList) => {





    async function onSubmit(event) {
        event.preventDefault();


        if (!movieOneStr && !movieTwoStr && !movieThreeStr) { setError("You have not chosen any movies!"); return }


        setView('THINKING')
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    movieOne: movieOneStr(),
                    movieTwo: movieTwoStr(),
                    movieThree: movieThreeStr()
                }),
            });
            const data = await response.json();
            if (response.status !== 200) { throw data.error || new Error(`Request failed with status ${response.status}`); }



            // setMovieStr(data.result)

            screenResult(data.result)
        } catch (error) {
            console.error("on submit err: ", error);
        }
    }





    async function onTryAgain(result) {
        setView('THINKING')
        var newToBeExcluded = toBeExcluded
        newToBeExcluded.push(result)
        setToBeExcluded(newToBeExcluded)
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    movieOne: movieOneStr(),
                    movieTwo: movieTwoStr(),
                    movieThree: movieThreeStr(),
                    toBeExcluded: toBeExcluded,
                    theLoveList: theLoveList,
                    theHateList: theHateList
                }),
            });
            const data = await response.json();
            if (response.status !== 200) {
                throw data.error || new Error(`Request failed with status ${response.status}`);
            }
            // setMovieStr(data.result)
            screenResult(data.result)
        } catch (error) {
            console.error("on try again err: ", error);
        }
    }

    return [
        onSubmit,
        onTryAgain
    ]

}

export default useSubmitEvents;