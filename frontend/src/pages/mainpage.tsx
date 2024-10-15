import PageHeader from "../components/Page_Header"
import PageFooter from "../components/Page_Footer"
import './mainpage.css'

export default function MainPage () {
    const gotoChatRoom = () => {
        window.location.href = '/chatroom'
    }

    return(
        <div className="MainPage">
            <PageHeader />
            <div className="MainPage_content">
                <div className="MainPage_title">
                    <h1>Welcome to Particle Network</h1>
                    <p>This is a simple web application that allows users to sign up and log in using their wallet addresses.</p>
                </div>
                <div className="MainPage_container">
                    <button className="MainPage_app" onClick={gotoChatRoom}>Chat Room</button>
                    <button className="MainPage_app">Chat Room</button>
                    <button className="MainPage_app">Chat Room</button>
                    <button className="MainPage_app">Chat Room</button>
                    <button className="MainPage_app">Chat Room</button>
                    <button className="MainPage_app">Chat Room</button>
                    <button className="MainPage_app">Chat Room</button>
                    <button className="MainPage_app">Chat Room</button>
                    <button className="MainPage_app">Chat Room</button>
                    <button className="MainPage_app">Chat Room</button>
                    <button className="MainPage_app">Chat Room</button>
                </div>
            </div>
            <PageFooter />
        </div>
    )
}