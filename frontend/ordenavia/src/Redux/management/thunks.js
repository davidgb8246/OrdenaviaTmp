import { api } from '../../utils/axios';
import { ENVS } from '../../utils/envs';
import { setRestaurant, setRestaurantsList } from './managementSlice';


export const createRestaurant = (data) => {
    return async (dispatch) => {
        try {
            const response = await api.post('/management/create_restaurant/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response);
            
        } catch (error) {
            const { status, errors } = JSON.parse(error.response.request.response);
            console.log("Create Restaurant error:", status);
            console.log(errors);
        }
    };
};


export const updateRestaurant = (restaurantId, data, after = null) => {
    return async (dispatch) => {
        try {
            const response = await api.put(`/management/${restaurantId}/update_restaurant/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response);

            const { status } = response.data;
            if (status === "MANAGEMENT_RESTAURANT_UPDATE_SUCCESS") {
                if (after) {
                    after();
                }
            }
            
        } catch (error) {
            const { status, errors } = JSON.parse(error.response.request.response);
            console.log("Update Restaurant error:", status);
            console.log(errors);
        }
    };
}


export const deleteRestaurant = (restaurantId, success = undefined) => {
    return async (dispatch) => {
        try {
            const response = await api.delete(`/management/${restaurantId}/delete_restaurant/`);
            console.log(response);

            const { status } = response.data;
            if (status == "MANAGEMENT_RESTAURANT_DELETE_SUCCESS") {
                if (success) {
                    success();
                }
            }
            
        } catch (error) {
            const { status, errors } = JSON.parse(error.response.request.response);
            console.log("Delete Restaurant error:", status);
            console.log(errors);
        }
    };
}


export const getRestaurants = () => {
    return async (dispatch) => {
        try {
            const response = await api.get('/management/get_restaurants/');
            const { restaurants } = response.data.data;

            dispatch(setRestaurantsList(restaurants));
            
        } catch (error) {
            const { status, errors } = JSON.parse(error.response.request.response);
            console.log("List Restaurants error:", status);
            console.log(errors);
        }
    };
}


export const getRestaurantInfo = (restaurantId, after = undefined) => {
    return async (dispatch) => {
        try {
            const response = await api.get(`/management/${restaurantId}/get_restaurant/`);
            const data = response.data.data;
            const { restaurant } = data;
            
            dispatch(setRestaurant(restaurant));

            if (after) {
                after(data);
            }
            
        } catch (error) {
            const { status, errors } = JSON.parse(error.response.request.response);
            console.log("Get Restaurant Info error:", status);
            console.log(errors);
        }
    };
}


/*
name
description
legal_name
commercial_name
tax_id
fiscal_address
address
city
state
country
phone
email
google_maps_embed_url
image
*/