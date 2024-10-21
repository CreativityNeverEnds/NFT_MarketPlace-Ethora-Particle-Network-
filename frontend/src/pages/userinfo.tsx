import { useEthereum } from "@particle-network/authkit";
import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import './userinfo.css'
import {  useSnackbar } from "notistack";
import PageHeader from "../components/Page_Header"
import PageFooter from "../components/Page_Footer"

export default function UserInfo () {
    const { address } = useEthereum();
    const meta_address = localStorage.getItem('user')
    const [userDetail, setUserDetail] = useState({firstName: '', secondName: '', email: '', phoneNumber: '', walletAddress: ''})
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const getuserinfo = async(user_wallet_address:any) => {
        try {
            const res = await axios.post( `${process.env.REACT_APP_SERVER_URL}/api/users/getuserinfo`, {user_wallet_address} );
            setUserDetail(res.data.user)
            return res.data
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    }

    useEffect(() => {
        if (meta_address && !address) {
            getuserinfo(meta_address)
        } else {
            getuserinfo(address)
        }
    }, [meta_address, address, isModalOpen]);

    const gotoMainPage = () => {
        window.location.href = "/mainpage";
    }

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        setUpdateDetails({
            firstName: '',
            secondName: '',
            email: '',
            walletAddress: updateDetails.walletAddress,
        })
    };

    const [updateDetails, setUpdateDetails] = useState({
        firstName: '',
        secondName: '',
        email: '',
        walletAddress: '',
    });

    const handleChange = (e:any) => {
        const { id, value } = e.target;
        if (meta_address && !address) {
            setUpdateDetails(prevDetails => ({
                ...prevDetails,
                [id]: value, // Update the specific field based on input id
                walletAddress: meta_address // Update the wallet address if the user is logged in with MetaMask
            }));
        }
        if (!meta_address && address) {
            setUpdateDetails(prevDetails => ({
                ...prevDetails,
                [id]: value, // Update the specific field based on input id
                walletAddress: address // Update the wallet address if the user is logged in with MetaMask
            }));
        } else {
            setUpdateDetails(prevDetails => ({
                ...prevDetails,
                [id]: value // Update the specific field based on input id
            }));
        }
    };

    // Email validation function
    const validateEmail = (email:any) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
        return emailPattern.test(email);
    };

    const handleUpdate = async() => {
        if (updateDetails.firstName === '' || updateDetails.secondName === '' || updateDetails.email === '') {
            enqueueSnackbar('Please enter all fields.', { variant: 'error',
                anchorOrigin: {
                vertical: 'top',
                horizontal: 'center'
                }}
            );
        } else if (!validateEmail(updateDetails.email)) {
            enqueueSnackbar('Please enter a valid email address.', { variant: 'error',
                anchorOrigin: {
                vertical: 'top',
                horizontal: 'center'
                }}
            );
        } else {
            try {
                const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/users/update_data`, updateDetails);
                enqueueSnackbar(res.data.message, { variant: 'success',
                    anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center'
                    }}
                );
                setIsModalOpen(!isModalOpen);
            } catch (error :any) {
                if(error.status === 400) {
                    enqueueSnackbar("Please insert correct informations!", { variant: 'error',
                        anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center'
                        }}
                    );   
                } else {
                    enqueueSnackbar("An error occurred while trying to log in!", { variant: 'error',
                        anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center'
                        }}
                    );
                }
            }
        }
    }

    const handleCancel = () => {
        setUpdateDetails({
            firstName: '',
            secondName: '',
            email: '',
            walletAddress: updateDetails.walletAddress,
        })
    }

    return(
        <div className="UserInfo">
            <PageHeader />
            <div className="UserInfo_content">
                <div style={{width:'100%', display:'flex',justifyContent: "end"}}>
                    <button className="UserInfo_return_btn" onClick={gotoMainPage}>Return</button>
                </div>
                <div className="UserInfo_title">
                    My Information
                </div>
                <div className="UserInfo_infos">
                    <div className="UserInfo_left">
                        <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
                            <img src="/avatar/avatar_1.png" className="UserInfo_avatar"/>
                        </div>
                        {/* <div style={{width:'100%', display:'flex', justifyContent:'center', marginTop:'20px'}}>
                            <button className="UserInfo_avatar_button">
                                Change Avatar
                            </button>
                        </div> */}
                    </div>
                    <div className="UserInfo_right">
                        <div style={{display:'flex', alignItems:'center'}}>
                            <span style={{fontSize:'16px', width:'130px', textAlign:'center'}}>Email&nbsp;:</span>
                            <input id="showEmail" type="text" className="UserInfo_input" value={userDetail.email} disabled/>
                        </div>
                        <div style={{display:'flex', alignItems:'center'}}>
                            <span style={{fontSize:'16px', width:'130px', textAlign:'center'}}>FirstName&nbsp;:</span>
                            <input id="showFirstName" type="text" className="UserInfo_input" value={userDetail.firstName} disabled/>
                        </div>
                        <div style={{display:'flex', alignItems:'center'}}>
                            <span style={{fontSize:'16px', width:'130px', textAlign:'center'}}>SecondName&nbsp;:</span>
                            <input id="showSecondName" type="text" className="UserInfo_input" value={userDetail.secondName} disabled/>
                        </div>
                        <div style={{display:'flex', alignItems:'center'}}>
                            <span style={{fontSize:'16px', width:'130px', textAlign:'center'}}>PhoneNumber&nbsp;:</span>
                            <input id="showPhoneNumber" type="text" className="UserInfo_input" value={userDetail.phoneNumber} disabled/>
                        </div>
                        <div style={{display:'flex', alignItems:'center'}}>
                            <span style={{fontSize:'16px', width:'130px', textAlign:'center'}}>Wallet&nbsp;Address&nbsp;:</span>
                            <input id="showWalletAddress" type="text" className="UserInfo_input" value={userDetail.walletAddress} disabled/>
                        </div>
                        <div style={{width:'100%', display:'flex',justifyContent: "center"}}>
                            <button className="UserInfo_change_btn" onClick={toggleModal}>Change Info</button>
                            <Modal isOpen={isModalOpen} onClose={toggleModal}>
                                <div>
                                    <div className="UserInfo_modaltitle">User Information</div>
                                    <input 
                                        id="firstName" 
                                        type="text" 
                                        className="UserInfo_modal_input" 
                                        placeholder={userDetail.firstName}
                                        value={updateDetails.firstName}
                                        onChange={handleChange}
                                    />
                                    <input 
                                        id="secondName" 
                                        type="text" 
                                        className="UserInfo_modal_input" 
                                        placeholder={userDetail.secondName}
                                        value={updateDetails.secondName}
                                        onChange={handleChange}
                                    />
                                    <input 
                                        id="email" 
                                        type="email" 
                                        className="UserInfo_modal_input" 
                                        placeholder={userDetail.email}
                                        value={updateDetails.email}
                                        onChange={handleChange}
                                    />
                                    <div>
                                        <button className="UserInfo_modal_button" onClick={handleUpdate}>Update</button>
                                        <button className="UserInfo_modal_button_cancel" onClick={handleCancel}>Cancel</button>
                                    </div>
                                </div>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
            <PageFooter />
        </div>
    )
}