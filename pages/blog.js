import Head from "next/head";



const blogEntries = [
    {
        name: "The Great Beauty",
        director: "Paolo Sorrentino",
        year: "2013",
        imgUrl: "https://m.media-amazon.com/images/M/MV5BZmQ3ZmYyNWYtNmNjMi00ODk0LTkxN2EtYTEzYjA3NzFlNDQ0XkEyXkFqcGdeQXVyNzg4NTYzNjc@._V1_.jpg",
        blurb: "Jep Gambardella, an ageing socialite, wrote a novel in his twenties that catapulted him to international fame. But on his 65th birthday, a shock from the past makes him take stock of the life he led.",
        link: "https://www.amazon.com/gp/search?ie=UTF8&tag=which2watch-20&linkCode=ur2&linkId=97487c588fe77626fe190d79d076da4d&camp=1789&creative=9325&index=instant-video&keywords=the great beauty"
    },
    {
        name: "The Royal Tenenbaums",
        director: "Wes Anderson",
        year: "2002",
        imgUrl: "https://m.media-amazon.com/images/I/81yWGGX9UqL._AC_UF894,1000_QL80_.jpg",
        blurb: "The Tenenbaums are a talented family of former child prodigies. However, they are not on the best of terms. When their ailing father summons them all, they find themselves under one roof.",
        link: "https://www.amazon.com/gp/search?ie=UTF8&tag=which2watch-20&linkCode=ur2&linkId=76b1c4b2761dc22dc671a3257fc2d92e&camp=1789&creative=9325&index=instant-video&keywords=the royal tenenbaums"
    },
    {
        name: "Blade Runner",
        director: "Ridley Scott",
        year: "1982",
        imgUrl: "https://m.media-amazon.com/images/M/MV5BNzQzMzJhZTEtOWM4NS00MTdhLTg0YjgtMjM4MDRkZjUwZDBlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
        blurb: "Rick Deckard, an ex-policeman, becomes a special agent with a mission to exterminate a group of violent androids. As he starts getting deeper into his mission, he questions his own identity.",
        link: "https://www.amazon.com/gp/search?ie=UTF8&tag=which2watch-20&linkCode=ur2&linkId=07f07648ccf8ee1f8c3c4ab39f72471c&camp=1789&creative=9325&index=instant-video&keywords=blade runner"
    },
    {
        name: "12 Angry Men",
        director: "Sidney Lumet",
        year: "1957",
        imgUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/12_Angry_Men_%281957_film_poster%29.jpg",
        blurb: "In a hot jury room in New York City, 12 men discuss the innocence or guilt of a teenager accused of murdering his father. As time passes, they begin to question their own values and morals.",
        link: "https://www.amazon.com/gp/search?ie=UTF8&tag=which2watch-20&linkCode=ur2&linkId=c53ea842d290dc0f76c0a0818e133e9d&camp=1789&creative=9325&index=instant-video&keywords=12 angry men"
    }
]




const Blog = () => (

    <div>
        <Head>
            <title>Blog</title>
            <link rel="icon" href="/Whattowatch_fav.png" />
        </Head>


        <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: "600px", margin: "120px 0px", lineHeight: "2" }}>

                <img src="/Which2watch_title.svg" style={{ width: "100%", marginTop: "-160px" }} />

                <h1 style={{marginTop: "-120px"}}>{"What we're watching"}</h1>

                <div style={{ height: "80px" }} />

                {blogEntries.map((entry, idx) => (
                    <div key={idx} style={{ marginBottom: "80px" }}>
                        <div style={{ display: "flex" }}>

                            <div style={{ marginRight: "16px" }}>
                                <img style={{ width: "240px" }} src={entry.imgUrl}></img>
                            </div>

                            <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <h3>{`${entry.name} (${entry.year})`}</h3>
                                <h3>{`Directed by ${entry.director}`}</h3>
                                <div>{entry.blurb}</div>
                                <a href={entry.link} target="_blank">
                                    <h3>{"Watch it here!"}</h3>
                                </a>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    </div>
)

export default Blog;