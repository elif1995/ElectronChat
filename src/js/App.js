import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector} from "react-redux";
import StoreProvider from "./store/StoreProvider";

import HomeView from "./views/Home";
import WelcomeView from "./views/Welcome";
import Settings from "./views/settings";
import ChatView from "./views/Chat";
import ChatCreate from "./views/ChatCreate";

import { listenToAuthChanges } from "./actions/auth";
import { listenToConnectionChanges } from "./actions/app";
import { checkUserConnection } from "./actions/connection";
import LoadingView from "./components/shared/LoadingVIew";

import { 
  HashRouter as Router, 
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

function AuthRoute({children}){
  const user = useSelector(({auth}) => auth.user)

  return  user ? children : <Navigate to="/" />
}

function ChatApp() {

 const dispatch = useDispatch()
 const isChecking = useSelector(({auth})=>auth.isChecking)
 const isOnline = useSelector(({app})=> app.isOnline);
 const user = useSelector(({auth})=> auth.user)

  useEffect(()=>{
    const unsubFromAuth = dispatch(listenToAuthChanges());
    const unsubFromConnection = dispatch(listenToConnectionChanges())

    return  () => {
      unsubFromAuth();
      unsubFromConnection();
      
    }
  },[dispatch])

  useEffect(()=>{
    let unsubFromUserConnection;
    if(user?.uid){
      const unsubFromUserConnection = dispatch(checkUserConnection(user.uid))
    }

    return () => {
      unsubFromUserConnection && unsubFromUserConnection();
    }

  },[dispatch, user])
  
  if(!isOnline){
    return <LoadingView message="App is disconnected from the internet"/>
  }

  if(isChecking){
    return <LoadingView/>
  }

  return(
      <Router>
          <div className='content-wrapper'>
            <Routes>
                <Route path="/" element={<WelcomeView/>} exact/>
                <Route path="/home" element={
                <AuthRoute>
                  <HomeView/>
                </AuthRoute>} 
                />
                <Route path="/chatCreate" element={
                  <AuthRoute>
                    <ChatCreate/>
                  </AuthRoute>
                }
                />

                <Route path="/chat/:id" element={
                <AuthRoute>
                  <ChatView/>
                </AuthRoute>} 
                />

                <Route path="/settings" element={
                <AuthRoute>
                  <Settings/> 
                </AuthRoute>}
                />
                
            </Routes>
          </div>
      </Router>
    
  )
}


export default function App(){
  return(
    <StoreProvider>
      <ChatApp/>
    </StoreProvider>
  )
}