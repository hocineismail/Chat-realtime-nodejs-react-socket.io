import React from 'react'
import './ChatComponent.css'
import { v4 as uuidv4 } from 'uuid';
import socketIOClient from "socket.io-client";
//you should  change The host or your network 
//const socket = socketIOClient("http://ismailHocine.com");
const socket = socketIOClient("http://192.168.1.46:3001");


export default function ChatComponent() {

    var timeout = undefined

    const [ value, setvalue ] = React.useState('') 
    const [ typing, settyping] = React.useState(false);
    const [ messages, setMessages ] = React.useState([])
   
    React.useState(()=> {
        // Generate an id for current user
        window.localStorage.setItem('user', uuidv4());
    },[])


    React.useEffect(() => {
        //receive message from server 
        socket.on('receive message', reason => {
            const newMessage = reason.message
            console.log(newMessage);
            setMessages([...messages, newMessage])
        });
        
        //receive the typing status from server 
        socket.on('typing', reason => {
            
            settyping(reason.value);
            clearTimeout(timeout);
            timeout = setTimeout(typingTimeout, 3000); 
         });

        //receive message from server for removing from our localdata
        socket.on('remove message', reason => {
            const removeMessage =  messages.filter((item) => item._id !== reason._id);
            setMessages(removeMessage);
          });


        return() =>{ 
            socket.off('typing');
            socket.off('send message');
            socket.off('receive message')
            socket.off('remove message');
             
        }
    })
 
    const onSubmit = (e) => {
        e.preventDefault()
        let data = {
            _id: uuidv4(),
            user: window.localStorage.getItem('user'),
            message: value,
            createAt: Date()
        }
        //Sending the message to server
        socket.emit('new message', data);
        setvalue('')
    }
    
    const ontyping = (e) => {
        setvalue(e)
        //Check if input is not empty
        if (e.length !== 0) {
            //Sending the typing status to server
            socket.emit('typing', { value: true });
        }  
        
    }

    const onRemove = (_id) => {
        let data = {
            _id: _id
        }
        //Sending an id of message to server
        socket.emit('remove message', data);
          
    }
     
    //function disable the typing status
    function typingTimeout() {
        settyping(false)
    }
    return (
        <div>
            <div className='card card-chat'>
                <div className='section-chat-message'>
                    <div className='card-body'> 
                        {messages.map(item => 
                        <div className='card-message'>
                            <div className='avatar'>
                                <img 
                                    width='100%' 
                                    src='https://png.pngtree.com/png-clipart/20190924/original/pngtree-user-vector-avatar-png-image_4830521.jpg' 
                                    alt='avatar'
                                /> 
                            </div>
                            <div className={`text-${window.localStorage.getItem('user') === item.user ? 'sent' :'received'}`}>
                                <p>
                                    {item.message}
                                </p>
                            </div>
                            {
                                window.localStorage.getItem('user') === item.user ?
                                <button className='btn btn-danger button-delete ' onClick={() => onRemove(item._id)}>
                                     <i className="far fa-trash-alt"></i>
                                </button> 
                                :
                                null
                            }

                        </div>
                        )}
                    </div>
                </div>
                <div className='section-input'>
                <p> User is 
                { typing ? (
                    <spqn> Typing...!</spqn>
                    ) : 
                    <spqn> Reading</spqn> }
                 </p>
                     <form onSubmit={onSubmit}> 
                        <div className='grid-5fr-1fr'>
                            <div>
                                <input
                                    type='text' 
                                    value={value}  
                                    onChange={(e) => ontyping(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                            <div> 
                                <button className='btn btn-primary button-send' onClick={onSubmit}>
                                    Send
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div> 
        </div>
    )
}
