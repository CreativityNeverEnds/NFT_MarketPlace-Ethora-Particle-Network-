import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useEthereum } from "@particle-network/authkit";
import axios from 'axios';
import './multichatroom.css'
import { truncateAddress } from "../../utils/utils";
import Modal from "../../components/Modal";
import {  useSnackbar } from "notistack";

// Define the structure of a message
interface Message {
    message: string;
    from: string;
    roomID: string;
    sendtime: string;
}

interface newMessage {
    message: string;
    from: string;
}

interface User {
    email: string;
    firstName: string;
    phoneNumber: string;
    secondName: string;
    walletAddress: string;
    _id: string;
}

interface MultiChatRoomProps {
    setChattype: (type: string) => void; // Adjust the type as necessary
}

interface MultiChatRoomProps {
    setChattingUser: (type: string) => void; // Adjust the type as necessary
}

const socket = io(process.env.REACT_APP_SERVER_URL); // Your WebSocket server URL

const MultiChatRoom: React.FC<MultiChatRoomProps> = (props:any) => {
    const { address } = useEthereum();
    const meta_address = localStorage.getItem('user')
    const [messages, setMessages] = useState<Message[]>([]); // Array of messages
    const [messageInput, setMessageInput] = useState<string>(''); // Input message
    const [account, setAccount] = useState<string>(''); // User account
    const [newmessage, setNewMessage] = useState<newMessage[]>([]); // New message
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [userNames, setUserNames] = useState<{ [key: string]: { firstName: string; secondName: string } }>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userdatailInfo, setUserdatailInfo] = useState<User>();
    const { enqueueSnackbar } = useSnackbar();
    const setChattype = props.setChattype;
    const setChattingUser = props.setChattin
    const [searchText, setSearchText] = useState('');
    const [placefilter, setPlaceFilter] = useState('Wallet Address')
    const [filtertype, setFilterType] = useState('walletAddress')

    const fetchName = async(addresses: any) => {
        // Fetch the name of the user from the server
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/api/users/get_name`,
                {addresses},
                { withCredentials: true}
            );
            const users: User[] = res.data.names;
            const namesMap: { [key: string]: { firstName: string; secondName: string } } = {};
            users.forEach(user => {
                namesMap[user.walletAddress] = {
                    firstName: user.firstName,
                    secondName: user.secondName
                };
            });

            setUserNames(namesMap); 
        } catch (error) {
            console.error("Error fetching user name:", error);
        }
    }
    
    const fetchAlluser = async() => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_SERVER_URL}/api/users/get_all_user`,
                { withCredentials: true}
            );
            setAllUsers(res.data.data)
        } catch (error) {
            console.error("Error fetching user name:", error);
        }
    }
    
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.post(
                    `${process.env.REACT_APP_SERVER_URL}/api/messages/get_message`,
                    { type: "All" },
                    { withCredentials: true }
                );
                const fetchedMessages = res.data.data;
                setMessages(fetchedMessages);
                const uniqueAddresses = Array.from(new Set(fetchedMessages.map((msg:any) => msg.from)));
                await fetchName(uniqueAddresses);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages(); // Call the async function
    },[messages]);

    useEffect(() => {
        fetchAlluser()
        // get the user's account
        if (!address && meta_address) {
            setAccount(meta_address)
            socket.emit('join', meta_address);
        } else if (address && !meta_address){
            setAccount(address)
            socket.emit('join', address);
        }

        socket.on('connection', () => {
            console.log('Connected to Socket.io server');
        });

        // Listen for updates to the list of active users
        socket.on('activeUsers', async(users) => {
            setActiveUsers(users)
        });

        // Listen for incoming messages
        socket.on('message', async(message) => {
            // Add new message to the messages array
            setNewMessage([...newmessage, message]);
            
            // Format the send time to a readable format
            const now = new Date();
            const formattedDateTime = 
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const currentAddress = address || meta_address;
            if(currentAddress && message.from === currentAddress){
                // Save the message to the server
                const newMsg = {from:message.from, message:message.text, roomID:'All', sendtime:formattedDateTime}
                await axios.post( `${process.env.REACT_APP_SERVER_URL}/api/messages/save_message`, {newMsg}, { withCredentials: true } );
    
                // Fetch all messages from the server and update the local state
                const res = await axios.post( `${process.env.REACT_APP_SERVER_URL}/api/messages/get_message`, {type:"All"}, { withCredentials: true } );
                setMessages(res.data.data)
            }
        });

        return () => {
            socket.off('activeUsers'); // Clean up listener on unmount
            socket.off('message'); // Clean up listener on unmount
        };

    }, []);

    const sendMessage = () => {
        if (messageInput) {
            // Send message along with the user's account address
            socket.emit('message', { text: messageInput, from: account });
            setMessageInput(''); // Clear input after sending
        }
    };

    const extractFirstLetter = (text: string) => {
        const letter = text.split(' ') // Split the string into words
            .map(word => word.charAt(0)) // Get the first letter of each word
            .join(''); // Join them into a single string
        return letter; // Update state with the result
    };
    
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen)
    };

    const showUserInfo = (user: any) => {
        toggleModal();
        setUserdatailInfo(user)
    }

    const createDM = async() => {
        if(userdatailInfo){
            const now = new Date();
            const formattedDateTime = 
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            if(address && !meta_address) {
                const create_dm = {from:address, to:userdatailInfo.walletAddress, message:"Hello", sendtime:formattedDateTime}  
                try {
                    await axios.post( `${process.env.REACT_APP_SERVER_URL}/api/dmessages/create_dmessage`, create_dm, { withCredentials: true } );
                    setChattype("DirectChat")
                    setChattingUser(userdatailInfo)
                } catch (error:any) {
                    if(error.response.status === 400) {
                      enqueueSnackbar(error.response.data.message, { variant: 'info',
                        anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center'
                        }}
                      );
                    } else {
                      enqueueSnackbar('An error occured. Please try again.', { variant: 'error',
                        anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center'
                        }}
                      );
                    }
                }
            } else if(!address && meta_address) {
                const create_dm = {from:meta_address, to:userdatailInfo.walletAddress, message:"Hello", sendtime:formattedDateTime}
                try {
                    await axios.post( `${process.env.REACT_APP_SERVER_URL}/api/dmessages/create_dmessage`, create_dm, { withCredentials: true } );
                    setChattype("DirectChat")
                    setChattingUser(userdatailInfo)
                } catch (error:any) {
                    if(error.response.status === 400) {
                      enqueueSnackbar(error.response.data.message, { variant: 'info',
                        anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center'
                        }}
                      );
                    } else {
                      enqueueSnackbar('An error occured. Please try again.', { variant: 'error',
                        anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center'
                        }}
                      );
                    }
                }
            }
        } else {
            enqueueSnackbar('There is no user you want to meet.', { variant: 'error',
                anchorOrigin: {
                vertical: 'top',
                horizontal: 'center'
                }}
            );
        }
    }
    
    const handleInputChange = (e:any) => {
        setSearchText(e.target.value.toLowerCase());
    };

    const changeFilter = () => {
        setPlaceFilter(placefilter === 'Wallet Address' ? 'Username' : 'Wallet Address');
        setFilterType(filtertype === 'walletAddress' ? 'username' : 'walletAddress');
        setSearchText('');
    }

    const filteredUsers = filtertype === 'walletAddress'
    ? allUsers?.filter(item =>
        item.walletAddress.toLowerCase().includes(searchText.toLowerCase())
      )
    : allUsers?.filter(item =>
        `${item.firstName} ${item.secondName}`.toLowerCase().includes(searchText.toLowerCase())
      );

    return (
        <div className="multichat">
            <div className="multichat_usermenu">
                <div className='multichat_usermenu_search'>
                    <input
                        type="text"
                        placeholder={placefilter}
                        value={searchText}
                        onChange={handleInputChange}
                        className='multichat_usermenu_searchbar'
                    />
                    <button className='multichat_usermenu_searchicon' onClick={changeFilter}>
                        <img src="/icon/filter.png"/>
                    </button>
                </div>
                {
                    filteredUsers?.map((user, index) => {
                        // Check if the user is active
                        const isActive = activeUsers.includes(user.walletAddress); // Assuming user has a walletAddress property
                        return (
                            <div key={index} className="multichat_user">
                                <button className="multichat_user_button" onClick={() => showUserInfo(user)}>
                                    <div className={`multichat_user_avatar ${isActive ? 'multichat_user_avatar_live' : ''}`}>
                                        {extractFirstLetter(user.firstName) + extractFirstLetter(user.secondName)}
                                    </div>
                                    <div className="multichat_user_username">
                                        {user.firstName} {user.secondName}
                                        <div className="multichat_user_address">
                                            {truncateAddress(user.walletAddress || "")}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        );
                    })
                }
            </div>
            <div className="multichat_container">
                <div className="multichat_message">
                    <img src="/icon/message.png" className='multichat_message_icon' />
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className='multichat_message_input'
                    />
                    <button className='multichat_message_send' onClick={sendMessage}>
                        <img src="/icon/send.png"/>
                    </button>
                </div>
                <div className="multichat_message_content">
                    {messages?.map((msg, index) => {
                        const isActive = activeUsers.includes(msg.from); // Assuming user has a walletAddress property
                        return (
                            <div key={index} className="multichat_message_message">
                                {userNames[msg.from]
                                ? <div className={`multichat_message_avatar ${isActive ? 'multichat_message_avatar_live' : ''}`}>
                                    {extractFirstLetter(userNames[msg.from].firstName) + extractFirstLetter(userNames[msg.from].secondName)}
                                  </div>
                                : <div className={`multichat_message_avatar ${isActive ? 'multichat_message_avatar_live' : ''}`}>
                                    {extractFirstLetter(msg.from)}
                                  </div>
                                } 
                                <div className="multichat_message_text">
                                    <div style={{fontSize:'12px', fontFamily:'sans-serif'}}>{truncateAddress(msg.from)}</div>
                                    {msg.message}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={toggleModal}>
                <div className='userInfoModal_container'>
                    <div style={{fontSize:'16px', fontFamily:'sans-serif'}}>User Info</div>
                    <div className='userInfoModal_name'>{userdatailInfo?.firstName} {userdatailInfo?.secondName}</div>
                    <div style={{fontSize:'16px', fontFamily:'sans-serif', margin:'10px', marginTop:'20px'}}>
                        Address: {truncateAddress(userdatailInfo?.walletAddress || '')}
                    </div>
                    <div style={{fontSize:'16px', fontFamily:'sans-serif', margin:'10px', marginTop:'20px'}}>
                        Email: {userdatailInfo?.email}
                    </div>
                    <div style={{fontSize:'16px', fontFamily:'sans-serif', margin:'10px', marginTop:'20px'}}>
                        Phone: {userdatailInfo?.phoneNumber}
                    </div>
                    <div style={{width:'100%', textAlignLast: "center"}}>
                        <button className='userInfoModal_sendbtn' onClick={createDM}>
                            SEND MESSAGE
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MultiChatRoom;