import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { UseAppContext } from '../context/AppContext'
import Loading from '../components/Loading'

export function AuthLayout(){
  const { user, loadinguser } = UseAppContext();
  if (loadinguser === true) return <Loading/>
  if (!user) return <Navigate to='/login' replace/>
  return <Outlet/>
}

export function GuestLayout(){
  const { user, loadinguser } = UseAppContext();
  if (loadinguser === true) return <Loading/>
  if (user) return <Navigate to='/' replace/>
  return <Outlet/>
}