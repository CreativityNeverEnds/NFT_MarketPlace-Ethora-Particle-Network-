import { useState } from "react";
import './DetailInfo.css'
import {  useSnackbar } from "notistack";
import axios from "axios";

export default function DetailInfo(props:any){
    const address = props.address
    const { enqueueSnackbar } = useSnackbar();
    const [userDetails, setUserDetails] = useState({
        firstName: '',
        secondName: '',
        email: '',
        phoneNumber: '',
        walletAddress: address
    });

    const handleChange = (e:any) => {
        const { id, value } = e.target;
        setUserDetails(prevDetails => ({
            ...prevDetails,
            [id]: value, // Update the specific field based on input id
            walletAddress: address
        }));
    };

    // Email validation function
    const validateEmail = (email:any) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
        return emailPattern.test(email);
    };

    // Handle OK button click
    const handleOk = async() => {
        if (userDetails.firstName === '' || userDetails.secondName === '' || userDetails.email === '' || userDetails.phoneNumber === '') {
            enqueueSnackbar('Please enter all fields.', { variant: 'error',
                anchorOrigin: {
                vertical: 'top',
                horizontal: 'center'
                }}
            );
        } else if (!validateEmail(userDetails.email)) {
            enqueueSnackbar('Please enter a valid email address.', { variant: 'error',
                anchorOrigin: {
                vertical: 'top',
                horizontal: 'center'
                }}
            )
        }else {
            try {
                const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/users/login_data`, userDetails);
                enqueueSnackbar(res.data.message, { variant: 'success',
                    anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center'
                    }}
                );
                window.location.href = '/mainpage'
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
    };

    const handleCancel = () => {
        setUserDetails({
            firstName: '',
            secondName: '',
            email: '',
            phoneNumber: '',
            walletAddress: address
        })
    }

    return(
        <div className="DetailInfo_home">
            <div className="DetailInfo_title">
                Detail Information
            </div>
            <div className="DetailInfo_content">
                <input 
                    id="firstName" 
                    type="text" 
                    className="DetailInfo_input" 
                    placeholder="First Name"
                    value={userDetails.firstName}
                    onChange={handleChange}
                />
                <input 
                    id="secondName" 
                    type="text" 
                    className="DetailInfo_input" 
                    placeholder="Second Name"
                    value={userDetails.secondName}
                    onChange={handleChange}
                />
                <input 
                    id="email" 
                    type="email" 
                    className="DetailInfo_input" 
                    placeholder="name@example.com"
                    value={userDetails.email}
                    onChange={handleChange}
                />
                <input 
                    id="phoneNumber" 
                    type="text" 
                    className="DetailInfo_input" 
                    placeholder="Phone Number"
                    value={userDetails.phoneNumber}
                    onChange={handleChange}
                />
            </div>
            <div className="DetailInfo_btnset">
                <button className="DetailInfo_button" onClick={handleOk}>Ok</button>
                <button className="DetailInfo_button" onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    )
}