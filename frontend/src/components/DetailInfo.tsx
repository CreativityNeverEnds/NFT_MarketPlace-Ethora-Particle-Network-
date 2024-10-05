import React from "react";
import './detailInfo.css'

export default function DetailInfo(){
    return(
        <div className="DetailInfo_home">
            <div className="DetailInfo_title">
                Detail Information
            </div>
            <div className="DetailInfo_content">
                <input id="UserEmail" type="email" className="DetailInfo_email" placeholder="name@example.com"/>
            </div>
        </div>
    )
}