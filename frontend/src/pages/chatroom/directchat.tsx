import { useState, useEffect } from 'react';
import { useEthereum } from "@particle-network/authkit";
import axios from 'axios';
import { io } from 'socket.io-client';
import { truncateAddress } from "../../utils/utils";
import './directchat.css'

// Define the structure of a message
interface Message {
    message: string;
    from: string;
    to: string;
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

const socket = io(process.env.REACT_APP_SERVER_URL); // Your WebSocket server URL

export default function DirectChatRoom (props: any) {
    const { address } = useEthereum();
    const meta_address = localStorage.getItem('user')
    const [newmessage, setNewMessage] = useState<newMessage[]>([]); // New message
    const [messageInput, setMessageInput] = useState<string>(''); // Input message
    const [dmessages, setDMessages] = useState<Message[]>([]);
    const [contactUsers, setContactUsers] = useState<string[]>([]);
    const [userNames, setUserNames] = useState([{ firstName:'', secondName:'', walletAddress:'' }]);
    const [chatNames, setChatNames] = useState<{ [key: string]: { firstName: string; secondName: string } }>({});
    const [account, setAccount] = useState<string>(''); // User account
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    const [chattingUser, setChattingUser] = useState(props.chattingUser)
    const [blockOne, setBlockOne] = useState('')
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
            const users: any = res.data.names;
            setUserNames(users);
            const chatusers: User[] = res.data.names;
            const namesMap: { [key: string]: { firstName: string; secondName: string } } = {};
            chatusers.forEach(chatuser => {
                namesMap[chatuser.walletAddress] = {
                    firstName: chatuser.firstName,
                    secondName: chatuser.secondName
                };
            });

            setChatNames(namesMap);
        } catch (error) {
            console.error("Error fetching user name:", error);
        }
    }

    const extractFirstLetter = (text: string) => {
        const letter = text.split(' ') // Split the string into words
            .map(word => word.charAt(0)) // Get the first letter of each word
            .join(''); // Join them into a single string
        return letter; // Update state with the result
    };
    
    const fetchAllMessages = async () => {
        try {
            // Determine which address to use
            const userAddress = address || meta_address;

            if (userAddress) {
                const res = await axios.post(
                    `${process.env.REACT_APP_SERVER_URL}/api/dmessages/get_my_message`,
                    { address: userAddress },
                    { withCredentials: true }
                );
                // Handle the response if needed
                setDMessages(res.data.data.filter((message: any) => message.to === chattingUser.walletAddress || message.from === chattingUser.walletAddress))
                const Users = [...new Set(res.data.data.flatMap((item:any) => [item.from, item.to]))];
                const contactUsers:any = Users.filter(user => user !== userAddress);
                setContactUsers(contactUsers)
                fetchName(contactUsers);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };
    
    useEffect(() => {
        fetchAllMessages(); // Call the async function
    }, [address, meta_address, chattingUser, newmessage, blockOne, dmessages]);

    const sendMessage = () => {
        if (messageInput) {
            // Send message along with the user's account address
            socket.emit('dmessage', { text: messageInput, from: account });
            setMessageInput(''); // Clear input after sending
        }
    };

    useEffect(() => {
        const userAddress = address || meta_address;
        if (userAddress) {
            setAccount(userAddress);
            socket.emit('join', userAddress);
        }

        socket.on('connection', () => {
            console.log('Connected to Socket.io server');
        });

        // Listen for updates to the list of active users
        socket.on('activeUsers', async(users) => {
            setActiveUsers(users)
        });

        socket.on('dmessage', async(dmessage) => {
            // Add new message to the messages array
            setNewMessage([...newmessage, dmessage]);
            
            // Format the send time to a readable format
            const now = new Date();
            const formattedDateTime = 
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const currentAddress = address || meta_address;
            if(currentAddress && dmessage.from === currentAddress){
                // Save the message to the server
                const new_dm = {from:dmessage.from, to:chattingUser.walletAddress, message:dmessage.text, sendtime:formattedDateTime}
                await axios.post( `${process.env.REACT_APP_SERVER_URL}/api/dmessages/create_dmessage`, new_dm, { withCredentials: true } );
    
                // Fetch all messages from the server and update the local state
                fetchAllMessages();
            }
        });

        return () => {
            socket.off('activeUsers'); // Clean up listener on unmount
            socket.off('dmessage'); // Clean up listener on unmount
        };

    },[chattingUser,newmessage])
    
    const startChat = (user: any) => {
        setChattingUser(user)
    }
    
    const blockUser = async(chattingUser:any) => {
        const currentAddress = address || meta_address;
        setBlockOne(chattingUser.walletAddress)
        if(currentAddress){
            const delete_info = {sender:chattingUser.walletAddress, receiver:currentAddress}
            await axios.post( `${process.env.REACT_APP_SERVER_URL}/api/dmessages/block_user`, delete_info, { withCredentials: true } );
        }
        setChattingUser('')
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
    ? userNames.filter(item =>
        item.walletAddress.toLowerCase().includes(searchText.toLowerCase())
      )
    : userNames.filter(item =>
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
                    filteredUsers.map((user, index) => {
                        // Check if the user is active
                        const isActive = activeUsers.includes(user.walletAddress); // Assuming user has a walletAddress property
                        return (
                            <div key={index} className="multichat_user">
                                <button className="multichat_user_button" onClick={() => startChat(user)}>
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
                <div className="directchat_message_content">
                    {chattingUser &&
                    <div>
                        <div className='directchat_nav_content'>
                            <div className='directchat_nav_detail'>
                                <div className='directchat_nav_name'>
                                    {chattingUser.firstName} {chattingUser.secondName}
                                </div>
                                <div className='directchat_nav_address'>
                                    {truncateAddress(chattingUser.walletAddress)}
                                </div>
                            </div>
                            <div className='directchat_nav_button'>
                                <button className='directchat_nav_button_block' onClick={() => blockUser(chattingUser)}>Block</button>
                            </div>
                        </div>
                        <div className='directchat_message_main'>
                            {dmessages.map((dmsg, index) => {
                                const isActive = activeUsers.includes(dmsg.from); // Assuming user has a walletAddress property
                                return (
                                    <div key={index} className="multichat_message_message">
                                        {chatNames[dmsg.from]
                                        ? <div className={`multichat_message_avatar ${isActive ? 'multichat_message_avatar_live' : ''}`}>
                                            {extractFirstLetter(chatNames[dmsg.from].firstName) + extractFirstLetter(chatNames[dmsg.from].secondName)}
                                        </div>
                                        : <div className={`multichat_message_avatar ${isActive ? 'multichat_message_avatar_live' : ''}`}>
                                            {'Me'}
                                        </div>
                                        } 
                                        <div className="multichat_message_text">
                                            <div style={{fontSize:'12px', fontFamily:'sans-serif'}}>{truncateAddress(dmsg.from)}</div>
                                            {dmsg.message}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    }
                </div>
            </div>
        </div>
    );
}