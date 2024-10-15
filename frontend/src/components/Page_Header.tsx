import './Page_Header.css'

export default function PageHeader () {

    const gotoLogin = () => {
        localStorage.removeItem("room_style")
        window.location.href = '/signin'
    }

    const userInfo = () => {
        window.location.href = '/userinfo'
    }
    
    return(
        <div className="PageHeader">
            <div className="PageHeader_content">
                Super App
                <div className='PageHeader_user'>
                    <div className='PageHeader_avatar'>
                        <button style={{height:'100%'}} onClick={userInfo}>
                            <img src="/avatar/avatar_1.png" style={{width:'30px', height:'30px', borderRadius:'5px', marginLeft:'5px'}} />
                            <div style={{display:'flex', alignItems:'center', height:'15px', marginTop:'2px'}}>
                                <img src="/icon/coin.png" style={{width:'15px', height:'15px', borderRadius:'50%'}} />
                                100
                            </div>
                        </button>
                    </div>
                    <div className='PageHeader_logout'>
                        <button style={{height:'100%'}} onClick={gotoLogin}>
                            <img src="/icon/logout.png" style={{width:'50px', height:'50px'}} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}