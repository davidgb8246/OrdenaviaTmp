//El componente store.js contiene el estado de la aplicación y su funcion reducer.

import {configureStore} from '@reduxjs/toolkit'
import { userSlice } from './auth/userSlice'
import { managementSlice } from './management/managementSlice'

//Al configureStore se le pasará un objeto con una propiedad llamada reducer
//En caso de que haya varios estado globales
//En nuestro caso será el slice user

export const store = configureStore ({
    reducer:{
        user: userSlice.reducer,
        management: managementSlice.reducer,
    }
})

