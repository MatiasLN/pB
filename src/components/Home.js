import React from 'react'
import DisplayVersion from "./DisplayVersion";
import AutoUpdate from "./AutoUpdate";

function Home() {
    return (
        <>
            <header>
                <DisplayVersion />
                <AutoUpdate />
            </header>
            <div className="container">
                <p>Hello world!</p>
            </div>
        </>
    )
}

export default Home