import { useEffect, useState } from 'react'
import MultiChatRoom from "./multichatroom"
import ChanChatRoom from './chanchatroom'
import DirectChatRoom from './directchat'
import PageHeader from "../../components/Page_Header"
import PageFooter from "../../components/Page_Footer"
import './chatroom.css'
export default function ChatRoom () {
    const [chattype, setChattype] = useState<string>("MultiChat")
    const [chattingUser, setChattingUser] = useState<string>("")
    const [stylemulti, setStylemulti] = useState("ChatRoom_select_button_selected")
    const [styleroom, setStyleroom] = useState("ChatRoom_select_button")
    const [styledirect, setStyledirect] = useState("ChatRoom_select_button")
    useEffect(() => {
        if(localStorage.getItem('room_style') === "MultiChat") {
            setChattype("MultiChat")
            setStylemulti("ChatRoom_select_button_selected")
            setStyleroom("ChatRoom_select_button")
            setStyledirect("ChatRoom_select_button")
        } else if(localStorage.getItem('room_style') === "RoomChat") {
            setChattype("RoomChat")
            setStylemulti("ChatRoom_select_button")
            setStyleroom("ChatRoom_select_button_selected")
            setStyledirect("ChatRoom_select_button")
        } else if(localStorage.getItem('room_style') === "DirectChat") {
            setChattype("DirectChat")
            setStylemulti("ChatRoom_select_button")
            setStyleroom("ChatRoom_select_button")
            setStyledirect("ChatRoom_select_button_selected")
        } else {
            setChattype("MultiChat")
            setStylemulti("ChatRoom_select_button_selected")
            setStyleroom("ChatRoom_select_button")
            setStyledirect("ChatRoom_select_button")
        }
        if (chattingUser !== '') {
            setChattype("DirectChat")
            setStylemulti("ChatRoom_select_button")
            setStyleroom("ChatRoom_select_button")
            setStyledirect("ChatRoom_select_button_selected")
        }
    }, [chattingUser])

    const changeType = (e:any) => {
        setChattype(e.target.id)
        setChattingUser('')
        if(e.target.id === "MultiChat") {
            setStylemulti("ChatRoom_select_button_selected")
            setStyleroom("ChatRoom_select_button")
            setStyledirect("ChatRoom_select_button")
            localStorage.setItem("room_style", "MultiChat")
        } else if(e.target.id === "RoomChat") {
            setStylemulti("ChatRoom_select_button")
            setStyleroom("ChatRoom_select_button_selected")
            setStyledirect("ChatRoom_select_button")
            localStorage.setItem("room_style", "RoomChat")
        } else {
            setStylemulti("ChatRoom_select_button")
            setStyleroom("ChatRoom_select_button")
            setStyledirect("ChatRoom_select_button_selected")
            localStorage.setItem("room_style", "DirectChat")
        }
    }
    
    return(
        <div className="ChatRoom">
            <PageHeader />
            <div className="ChatRoom_content">
                <div className="ChatRoom_container">
                    <div className="ChatRoom_select">
                        <button id="MultiChat" className={stylemulti} onClick={changeType}>MultiChat</button>
                        <button id="RoomChat" className={styleroom} onClick={changeType}>RoomChat</button>
                        <button id="DirectChat" className={styledirect} onClick={changeType}>DirectChat</button>
                    </div>
                    {chattype === "MultiChat" && <MultiChatRoom setChattype={setChattype} setChattingUser={setChattingUser}/>}
                    {chattype === "RoomChat" && <ChanChatRoom />}
                    {chattype === "DirectChat" && <DirectChatRoom chattingUser={chattingUser}/>}
                </div>
            </div>
            <PageFooter />
        </div>
    )
}