import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getRestaurantInfo } from "../../../Redux/management/thunks";



export const RestaurantDetail = () => {
    const { restaurant } = useSelector((state) => state.management);
    const { id: restaurantId } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getRestaurantInfo(restaurantId));
    }, []);

    useEffect(() => {
        console.log(restaurant);
    }, [restaurant]);


    return (
        <>
            <h1>Detalles del restaurante</h1>
            <hr />

            {restaurant ? (
                <>
                    <h2><a href={`/edit_restaurant/${restaurant?.id}`}>Editar Restaurante</a></h2>

                    <div key={restaurant.id}>
                        <div>
                            <img
                                src={restaurant.image}
                                alt={restaurant.name}
                                style={{ width: "200px", height: "auto" }}
                            />
                            <div>
                                <h5>{restaurant.name}</h5>
                                <p>{restaurant.description}</p>
                                <p>Dirección: {restaurant.address}</p>
                                <p>Teléfono: {restaurant.phone}</p>

                                <div>
                                    <p><strong>Horario:</strong></p>
                                    {restaurant.schedules && restaurant.schedules.length > 0 ? (
                                        <div>
                                            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((dayName, index) => {
                                                const daySchedules = restaurant.schedules.filter(
                                                    (schedule) => schedule.day_name === dayName
                                                );

                                                if (daySchedules.length > 0) {
                                                    return (
                                                        <div className="flex flex-row" key={index}>
                                                            <h6>{dayName}</h6>
                                                            <div className="flex flex-col">
                                                                {daySchedules.map((schedule) => (
                                                                    <div key={schedule.id}>
                                                                        <p>
                                                                            {schedule.opening_time} - {schedule.closing_time}
                                                                            {schedule.is_closed ? " (Cerrado)" : ""}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    ) : (
                                        <p>No hay horarios disponibles.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <p>Cargando...</p>
            )}
        </>
    );
};
