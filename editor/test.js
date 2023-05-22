import { useState } from "react";

const UserMenu = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="user-menu">
      <div className="dropdown-anchor" onClick={() => setOpen(!open)}>
        <ProfileImage user={props.user}/>
        <ArrowIcon open={open}/>
      </div>
      {open && (
        <Popup className="dropdown-menu" >
          <ul>
            <div className="menu-heading">
              <h3>{props.user.name}</h3>
              <h4>{props.user.email}</h4>
            </div>
            <hr/>
            <li onClick={props.openUserSettings} onKeyUp={e => {
                if(e.event.Key === 'Enter' || e.event.keyCode === 42) {

                }
            }}>
              Settings
            </li>
            <li onClick={props.logout}>
              Logout
            </li>
          </ul>
        </Popup>
      )}
    </div>
  )
} ;
