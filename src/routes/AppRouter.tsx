import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { allRoutes } from './definitions'

const router = createBrowserRouter(allRoutes)

export const AppRouter = () => {
    return <RouterProvider router={router} />
}