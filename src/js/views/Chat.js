
import React, { useEffect, useRef, useCallback } from "react";
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";

import ChatUserList from '../components/ChatUsersList';
import ChatMessagesList from '../components/ChatMessagesList';
import ViewTitle from '../components/shared/ViewTitle';
import {withBaseLayout} from "../layouts/Base";

import { 
  subscribeToChat, 
  subscribeToProfile, 
  sendChatMessage,
  subscribeToMessage,
  registerMessageSubscription 
} from "../actions/chats";

import LoadingView from "../components/shared/LoadingVIew";
import Messanger from "../components/Messenger";

function Chat(){
  const {id} = useParams()
  const peopleWatchers = useRef({})
  const messageList = useRef()
  const dispatch = useDispatch()
  const activeChat = useSelector(({chats}) => chats.activeChats[id])
  const messages = useSelector(({chats}) => chats.messages[id] || [])
  const messagesSub = useSelector(({chats}) => chats.messagesSubs[id])
  const joinedUsers = activeChat?.joinedUsers

  useEffect(() => {
    const unsubFromChat = dispatch(subscribeToChat(id))

    if(!messagesSub) {
      const unsubFromMessages = dispatch(subscribeToMessage(id))
      dispatch(registerMessageSubscription(id, unsubFromMessages))
    }

    return () => {
      unsubFromChat()
      unsubFromJoinedUser()
    }
  },[])

  useEffect(()=>{
    joinedUsers && subscribeToJoinedUsers(joinedUsers)
  },[joinedUsers])

  const subscribeToJoinedUsers = useCallback(jUsers => {
    jUsers.forEach(user => {
      
      if(!peopleWatchers.current[user.uid]){
        
        peopleWatchers.current[user.uid] = dispatch(subscribeToProfile(user.uid, id))
      }
    });
  },[dispatch, id])

  const sendMessage = message => {
    dispatch(sendChatMessage(message,id))
    .then(_ => messageList.current.scrollIntoView(false))
  }

  const unsubFromJoinedUser = useCallback(() => {
    Object.keys(peopleWatchers.current)
      .forEach(id => {
        
        peopleWatchers.current[id]()})
  },[peopleWatchers.current])

  if(!activeChat?.id){
    return <LoadingView message="Loading chat..."/>
  }

  return(
    <div className="row no-gutters fh">
      <div className="col-3 fh">
        <ChatUserList users={activeChat?.joinedUsers } />
      </div>
      <div className="col-9 fh">
        <ViewTitle text = {`channel: ${activeChat?.name}`}/>
        <ChatMessagesList innerRef={messageList} messages={messages} />
        <Messanger onSubmit={sendMessage}/>
      </div>
    </div>
  )
}

export default withBaseLayout(Chat,{canGoBack:true})