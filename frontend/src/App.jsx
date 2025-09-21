import React from 'react'
import './App.css'
import { BrowserRouter , Route, Routes } from 'react-router-dom';
import {SignupPage} from './pages/SignupPage';
import { SigninPage } from './pages/SigninPage';
import { Dashboard } from './pages/Dashboard';
import { SendMoney } from './pages/SendMoney';

function App() {

  

  return (

    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<SignupPage></SignupPage>}/>
      <Route path='/signin/' element={<SigninPage></SigninPage>}/>
      <Route path='/dashboard/' element={<Dashboard></Dashboard>}/>
      <Route path='/send/:to/:name' element={<SendMoney></SendMoney>}/>

      
    </Routes>
    </BrowserRouter>     
    </>
  )
}

export default App
