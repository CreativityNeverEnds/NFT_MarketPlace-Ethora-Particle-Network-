import { useState, useEffect } from 'react';
import { useEthereum } from "@particle-network/authkit";
import axios from 'axios';
import Modal from "../../components/Modal";
import './chanchatroom.css'
import { truncateAddress } from "../../utils/utils";
import {  useSnackbar } from "notistack";
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

interface User {
  email: string;
  firstName: string;
  phoneNumber: string;
  secondName: string;
  walletAddress: string;
  _id: string;
}

export default function ChanChatRoom () {
  const [showPanel, setShowPanel] = useState(false)
  const [channelname, setChannelname] = useState('')
  const { address } = useEthereum();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const meta_address = localStorage.getItem('user')
  const [allChannels, setAllChannels] = useState([{channelname:"", creator:"",visitors:[]}])
  const [myChannels, setMyChannels] = useState([{channelname:"", creator:"",visitors:[]}])
  const { enqueueSnackbar } = useSnackbar();

  const showAddPanel = () => {
    setShowPanel(true)
  }

  const handleChange = (e:any) => {
    setChannelname(e.target.value)
  }

  const AddChannel = async() => {
    setShowPanel(false)
    if(channelname) {
      try {
        if(address && !meta_address){
          const res = await axios.post(
              `${process.env.REACT_APP_SERVER_URL}/channels/save_new_channel`,
              {data: {channelname: channelname, creator: address}},
              { withCredentials: true}
          );
          enqueueSnackbar('Successfully created.', { variant: 'success',
            anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
            }}
          );
        }
        else if(!address && meta_address){
          const res = await axios.post(
              `${process.env.REACT_APP_SERVER_URL}/channels/save_new_channel`,
              {data: {channelname: channelname, creator: meta_address}},
              { withCredentials: true}
          );
          enqueueSnackbar('Successfully created.', { variant: 'success',
            anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
            }}
          );
        }
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
    setChannelname('')
  }

  const showAllPanel = () => {
    setIsModalOpen(true)
  }

  const toggleModal = () => {
      setIsModalOpen(!isModalOpen)
  };

  const joinChannel = async(e:any) => {
      try {
        if(address && !meta_address){
          const res = await axios.post(
              `${process.env.REACT_APP_SERVER_URL}/channels/join_channel`,
              {data: {channelname: e.channelname, creator: e.creator, myid:address}},
              { withCredentials: true}
          );
        }
        else if(!address && meta_address){
          const res = await axios.post(
              `${process.env.REACT_APP_SERVER_URL}/channels/join_channel`,
              {data: {channelname: e.channelname, creator: e.creator, myid:meta_address}},
              { withCredentials: true}
          );
        }
        enqueueSnackbar('Successfully joined.', { variant:'success',
          anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
          }}
        );
        setIsModalOpen(false)
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

  const fetchAllChannel = async() => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/channels/get_all_channel`,
        { withCredentials: true}
      );
      setAllChannels(res.data.data)
      if (address && !meta_address) {
        const filteredChannels = res.data.data.filter((channel:any) => channel.visitors.includes(address));
        setMyChannels(filteredChannels)
      } else if (!address && meta_address) {
        const filteredChannels = res.data.data.filter((channel:any) => channel.visitors.includes(meta_address));
        setMyChannels(filteredChannels)
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  }

  useEffect(() => {
    fetchAllChannel()
  },[isModalOpen, allChannels])

  ///////////
  const [username, setUsername] = useState<string>('');
  const [enterroom, setEnterRoom] = useState<string>('');
  const [enterroomdetail, setEnterRoomDetail] = useState({ channelname:'', creator: '', visitors: [] });
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [userNames, setUserNames] = useState<{ [key: string]: { firstName: string; secondName: string } }>({});

  useEffect(() => {
    if(address && !meta_address){
      setUsername(address)
      socket.emit('join', address);
    }
    else if(!address && meta_address){
      setUsername(meta_address)
      socket.emit('join', meta_address);
    }
  },[])

  const joinRoom = async(room:any) => {
    if (username && room) {
      setEnterRoom(room._id)
      setEnterRoomDetail(room)
      socket.emit('join_room', room._id);
    }
  };
  
  const [messages, setMessages] = useState<{ from: string; roomID: string; message: string; sendtime: string; }[]>([]);
  
  useEffect(() => {
    
    socket.on('connection', () => {
      console.log('Connected to Socket.io server');
    });
    // Listen for updates to the list of active users
    socket.on('activeUsers', async(users) => {
      setActiveUsers(users)
    });

    return () => {
      socket.off('activeUsers');
    };
  },[])

  useEffect(() => {
    socket.on('receive_message', async(data: { username: string; message: string; }) => {
      // Format the send time to a readable format
      const now = new Date();
      const formattedDateTime = 
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentAddress = address || meta_address;
      if(currentAddress && data.username === currentAddress){
        if(enterroom){
          // Save the message to the server
          const newMsg = {from:data.username, message:data.message, roomID:enterroom, sendtime:formattedDateTime} 
          await axios.post( `${process.env.REACT_APP_SERVER_URL}/messages/save_message`, {newMsg}, { withCredentials: true } );

          // Fetch all messages from the server and update the local state
          const res = await axios.post( `${process.env.REACT_APP_SERVER_URL}/messages/get_message`, {type:enterroom}, { withCredentials: true } );
          setMessages(res.data.data)
        }
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [enterroom]);

  const [messageText, setMessageText] = useState<string>('');

  const sendMessage = () => {
    if (messageText) {
      socket.emit('send_message', { message: messageText, username, room: enterroom });
      setMessageText('');
    }
  };
  
  const fetchName = async(addresses: any) => {
    // Fetch the name of the user from the server
    try {
      const res = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/users/get_name`,
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

  const extractFirstLetter = (text: string) => {
    const letter = text.split(' ') // Split the string into words
        .map(word => word.charAt(0)) // Get the first letter of each word
        .join(''); // Join them into a single string
    return letter; // Update state with the result
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if(enterroom){
        try {
          const res = await axios.post(
              `${process.env.REACT_APP_SERVER_URL}/messages/get_message`,
              { type: enterroom },
              { withCredentials: true }
          );
          const fetchedMessages = res.data.data;
          setMessages(fetchedMessages);
          const uniqueAddresses = Array.from(new Set(fetchedMessages.map((msg:any) => msg.from)));
          await fetchName(uniqueAddresses);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages(); // Call the async function
  },[messages,enterroom]);

  const leaveChannel = async (enterroom: any) => {
    try {
      const userAddress = address || meta_address;
      if (userAddress) {
        await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/channels/leave_channel`,
          { type: enterroom, myid: userAddress},
          { withCredentials: true }
        );
        setEnterRoom('')
      }
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
  }
  
  ///////////
  
  return(
    <div className='chanchat'>
      <div className="chanchat_chanmenu">
        <div className="chanchat_chanmenu_add">
          <button className="chanchat_chanmenu_add_btn" onClick={showAddPanel}>
            <div className="chanchat_chanmenu_add_letter">
              New Channel
            </div>
            <img src="/icon/addchannel.png" className='chanchat_chanmenu_add_icon' />
          </button>
        </div>
        {showPanel && 
          <div className="chanchat_chanmenu_add_panel">
            <input
                type="text" 
                className="chanchat_chanmenu_add_input" 
                placeholder="Channel Name"
                value={channelname}
                onChange={handleChange}
            />
            <button onClick={AddChannel}>
              <img src="/icon/add.png"  className={`chanchat_chanmenu_add_icon ${channelname==='' ? 'chanchat_chanmenu_add_icon_rotate' : ''}`} />
            </button>
          </div>
        }
        <div className={`chanchat_chanmenu_container ${showPanel ? 'chanchat_chanmenu_container_live' : ''}`}>
          <div className="chanchat_chanmenu_view">
            <button className="chanchat_chanmenu_view_btn" onClick={showAllPanel}>
              <div className="chanchat_chanmenu_view_letter">
                Add Channel
              </div>
              <img src="/icon/view.png" className='chanchat_chanmenu_view_icon' />
            </button>
          </div>
          <div className="chanchat_chanmenu_channel">
            {myChannels.map((myChannel, index) => {
              return(
                <div key={index} className='chanchat_chanmenu_item'>
                  <button className='chanchat_chanmenu_button' onClick={() => joinRoom(myChannel)}>
                    <img src="/icon/chatroom.png" style={{width: "45px", height: "45px", borderRadius:'20%'}} />
                    <div style={{display:'block', marginLeft:'5px'}}>
                      <div style={{display:'flex', justifyContent: "left", alignItems: "baseline"}}>
                        <div style={{width:'120px',fontSize:'18px', fontFamily:'sans-serif', textAlign:"left", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>
                          {myChannel.channelname}
                        </div>
                      </div>
                      <div style={{fontSize:'12px', fontFamily:'sans-serif'}}>
                        Create:{truncateAddress(myChannel.creator || '')}
                    </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="multichat_container">
        <div className="multichat_message">
          <img src="/icon/message.png" className='multichat_message_icon' />
          <input
            type="text"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className='multichat_message_input'
          />
          <button className='multichat_message_send' onClick={sendMessage}>
            <img src="/icon/send.png"/>
          </button>
        </div>
        <div className="chanchat_message_content">
          {(enterroom && enterroomdetail) &&
            <div>
              <div className="chanchat_nav_content">
                <div className='directchat_nav_detail'>
                  <div className='directchat_nav_name'>
                    {enterroomdetail.channelname}
                  </div>
                  <div className='directchat_nav_address'>
                  {enterroomdetail.visitors.length} members
                  </div>
                </div>
                <div className='directchat_nav_button'>
                  {(enterroomdetail.creator !== meta_address && enterroomdetail.creator !== address) && 
                    <button className='directchat_nav_button_block' onClick={() => leaveChannel(enterroom)}>Leave</button>
                  }
                </div>
              </div>
              <div className="chanchat_message_main">
                {messages.map((msg, index) => {
                  const isActive = activeUsers.includes(msg.from);
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
                        <div className="multichat_message_text">
                            <div style={{fontSize:'12px', fontFamily:'sans-serif'}}>{truncateAddress(msg.from)}</div>
                            {msg.message}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          }
        </div>
        <Modal isOpen={isModalOpen} onClose={toggleModal}>
          <div className='channelModal_container'>
            <div style={{fontSize:'18px', fontFamily:'sans-serif', marginLeft:'10px'}}>{allChannels.length} Channels</div>
            {allChannels.map((channel, index) => {
              return(
                <div key={index} className='channelModal_item'>
                  <button className='channelModal_button' onClick={() => joinChannel(channel)}>
                    <div style={{display:'flex'}}>
                      <div className='channelModal_member'>
                      </div>
                      <div className='channelModal_channame'>
                        {channel.channelname}
                      </div>
                      <div className='channelModal_member'>
                        <div style={{fontSize:'12px', float:'right'}}>
                          {channel.visitors.length} member(s)
                        </div>
                      </div>
                    </div>
                    <div style={{fontSize:'12px', fontFamily:'sans-serif'}}>
                      Created by {truncateAddress(channel.creator || '')}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </Modal>
      </div>
    </div>
  )
}

