import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { deleteRestaurant, getRestaurantInfo, updateRestaurant } from "../../Redux/management/thunks";
import { useForm } from "../../hooks/useForm";
import { useNavigate, useParams } from "react-router-dom";
import { ENVS } from "../../utils/envs";



const defaultSchedule = {
    day: 0,
    shift_name: "",
    open_time: "00:00",
    close_time: "00:00",
    is_closed: false,
};

const defaultCategory = {
    name: "",
    description: "",
    image: null,
    new_image: null,
};

const defaultProduct = {
    name: "",
    description: "",
    price: 0,
    image: null,
    new_image: null,
    category: null,
    is_available: true,
    is_featured: false,
    is_recommended: false,
    is_new: false,
};

const days = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

export const EditRestaurant = () => {
    const { onInputChange, setFormState, ...form } = useForm({
        name: '',
        description: '',
        legal_name: '',
        commercial_name: '',
        tax_id: '',
        fiscal_address: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
        google_maps_embed_url: '',
        image: null,
        new_image: null,
    });

    const [errorMessage, setErrorMessage] = useState();

    const sortSchedules = (data = schedules, modify = false) => {
        const schedulesSorted = [...data]
        .sort((a, b) => {
            if (a.day !== b.day) {
                return a.day - b.day;
            }

            console.log(a.open_time.localeCompare(b.close_time));

            return a.open_time.localeCompare(b.close_time);
        });

        console.log(schedulesSorted);

        if (modify) setSchedules(schedulesSorted);
        return schedulesSorted;
    };

    useEffect(() => {
        dispatch(getRestaurantInfo(restaurantId, (data) => {
            const { restaurant: restaurantData, categories, products } = data;
            const { schedules: restaurantSchedules = [], ...restaurant } = restaurantData;


            setFormState({
                ...form,
                ...restaurant,
            });

            sortSchedules(restaurantSchedules.map((schedule) => ({
                day: schedule.day_of_week,
                shift_name: schedule.shift_name,
                open_time: schedule.opening_time,
                close_time: schedule.closing_time,
                is_closed: schedule.is_closed,
            })), true);

            console.log(categories);
            console.log(products);


            setCategories(categories);
            setProducts(products);
        }));
    }, []);

    const { name, description, legal_name, commercial_name, tax_id, fiscal_address, image, new_image,
        address, city, state, country, phone, email, google_maps_embed_url } = form;

    const [schedules, setSchedules] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: restaurantId } = useParams();


    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...schedules];
        newSchedules[index][field] = value;

        if (field === "is_closed" && value) {
            newSchedules[index] = {
                ...defaultSchedule,
                day: newSchedules[index].day,
                is_closed: true,
            };
        }

        sortSchedules(newSchedules, true);
    };

    const handleCategoryChange = (index, field, value) => {
        const newCategories = [...categories];
        newCategories[index][field] = value;
        setCategories(newCategories);
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...products];
        newProducts[index][field] = value;
        setProducts(newProducts);
    };

    const handleFileChange = (e, after) => {
        const file = e.target.files[0];
        if (file) {
            const imageURL = URL.createObjectURL(file);

            after({
                file,
                image: imageURL,
            });
        }
    };

    const addSchedule = () => {
        const dayCounts = Array(7).fill(0);
    
        schedules.forEach(schedule => {
            if (typeof schedule.day === 'number' && schedule.day >= 0 && schedule.day <= 6) {
                dayCounts[schedule.day]++;
            }
        });
    
        let minCount = Math.min(...dayCounts);
        let dayToAdd = dayCounts.findIndex(count => count === minCount);
    
        const newSchedule = {
            ...defaultSchedule,
            day: dayToAdd,
        };
    
        const newSchedules = [...schedules, newSchedule];
        sortSchedules(newSchedules, true);
    };
    const removeSchedule = (index) => sortSchedules(schedules.filter((_, i) => i !== index), true);

    const addCategory = () => setCategories([...categories, { ...defaultCategory }]);
    const removeCategory = (index) => {
        const { name } = categories[index];
        setCategories(categories.filter((_, i) => i !== index));

        setProducts(products.map((prod) => {
            if (prod.category === name) {
                return {
                    ...prod,
                    category: null,
                };
            }
            return prod;
        }));
    };

    const addProduct = () => setProducts([...products, { ...defaultProduct }]);
    const removeProduct = (index) => setProducts(products.filter((_, i) => i !== index));


    const onSubmit = (e) => {
        e.preventDefault();

        const fields = [
            [name, "Nombre"],
            [legal_name, "Razón Social"],
            [commercial_name, "Nombre Comercial"],
            [tax_id, "RFC / NIT"],
            [fiscal_address, "Dirección Fiscal"],
            [address, "Dirección"],
            [city, "Ciudad"],
            [state, "Estado"],
            [country, "País"],
            [phone, "Teléfono"],
            [email, "Email"],
        ]

        for (let [field, fieldName] of fields) {
            if (!field.trim()) {
                setErrorMessage(`El campo ${fieldName} es requerido`);
                return;
            }
        }

        if (!google_maps_embed_url.trim().includes("embed")) {
            setErrorMessage(`La URL de Google Maps no es válida`);
            return;
        }

        const dayGroups = {};
        for (let schedule of schedules) {
            const { day, open_time, close_time, is_closed } = schedule;
            if (!dayGroups[day]) dayGroups[day] = [];
            dayGroups[day].push({ open_time, close_time, is_closed });
        }

        for (let i = 0; i < 7; i++) {
            if (!dayGroups[i] || dayGroups[i].length === 0) {
                setErrorMessage(`Falta definir un horario para ${days[i]}`);
                return;
            }
        }

        for (let day in dayGroups) {
            const entries = dayGroups[day];
            const closed = entries.filter(s => s.is_closed);
            const open = entries.filter(s => !s.is_closed);

            if (closed.length > 0 && entries.length > 1) {
                setErrorMessage(`En ${days[day]}, no se pueden mezclar horarios cerrados con abiertos.`);
                return;
            }

            for (let i = 0; i < open.length; i++) {
                const a = open[i];

                if (a.open_time >= a.close_time) {
                    setErrorMessage(`En ${days[day]}, la hora de apertura debe ser menor que la de cierre.`);
                    return;
                }

                for (let j = i + 1; j < open.length; j++) {
                    const b = open[j];

                    const conflict =
                        (a.open_time < b.close_time && a.close_time > b.open_time);

                    if (conflict) {
                        setErrorMessage(`Conflicto de horarios en ${days[day]}.`);
                        return;
                    }
                }
            }
        }

        for (let idx = 0; idx < categories.length; idx++) {
            const cat = categories[idx];
            if (!cat.name.trim()) {
                setErrorMessage(`El campo Nombre de la categoría ${idx + 1} es requerido`);
                return;
            }

            if (!cat.description.trim()) {
                setErrorMessage(`El campo Descripción de la categoría ${idx + 1} es requerido`);
                return;
            }
        }

        for (let idx = 0; idx < products.length; idx++) {
            const prod = products[idx];
            if (!prod.name.trim()) {
                setErrorMessage(`El campo Nombre del producto ${idx + 1} es requerido`);
                return;
            }

            if (!prod.description.trim()) {
                setErrorMessage(`El campo Descripción del producto ${idx + 1} es requerido`);
                return;
            }

            if (prod.price <= 0) {
                setErrorMessage(`El campo Precio del producto ${idx + 1} debe ser mayor que 0`);
                return;
            }

            if (!prod.category) {
                setErrorMessage(`El campo Categoría del producto ${idx + 1} es requerido`);
                return;
            }

            if (!prod.image) {
                setErrorMessage(`El campo Imagen del producto ${idx + 1} es requerido`);
                return;
            }
        }

        const formData = new FormData();
        formData.append('restaurant', JSON.stringify({ ...form }));
        formData.append('schedules', JSON.stringify(schedules));


        formData.append('categories', JSON.stringify(categories.map(cat => {
            const { image, new_image, ...rest } = cat;

            return {
                images_id: `category_image_${btoa(cat.name + cat.description)}`,
                ...rest,
            };
        })));

        categories.forEach((cat) => {
            if (cat.new_image) {
                formData.append(`category_image_${btoa(cat.name + cat.description)}`, cat.new_image);
            }
        });


        formData.append('products', JSON.stringify(products.map(prod => {
            const { image, new_image, ...rest } = prod;

            return {
                images_id: `product_image_${btoa(prod.name + prod.description)}`,
                ...rest,
            };
        })));

        products.forEach((prod) => {
            if (prod.new_image) {
                formData.append(`product_image_${btoa(prod.name + prod.description)}`, prod.new_image);
            }
        });


        formData.append('image', new_image);

        dispatch(updateRestaurant(restaurantId, formData, () => {
            // navigate("/restaurant/" + restaurantId);
            setErrorMessage("Restaurante editado correctamente");
        }
        ));
    };

    useEffect(() => {
        setTimeout(() => {
            setErrorMessage(null);
        }, 2000);
    }, [errorMessage]);


    const deleteRestaurantAction = () => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este restaurante?")) {
            dispatch(deleteRestaurant(restaurantId, () => {
                navigate("/list_restaurants");
            }));
        }
    }


    return (
        <form onSubmit={onSubmit}>
            <h2>Información del restaurante</h2>

            {errorMessage &&
                <>
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        {errorMessage}
                    </div>
                </>
            }

            <input value={name} type="text" name="name" placeholder="Nombre" onChange={onInputChange} />
            <textarea value={description} name="description" placeholder="Descripción" onChange={onInputChange} rows="4" style={{ resize: 'vertical' }} />
            <input value={legal_name} type="text" name="legal_name" placeholder="Razón Social" onChange={onInputChange} />
            <input value={commercial_name} type="text" name="commercial_name" placeholder="Nombre Comercial" onChange={onInputChange} />
            <input value={tax_id} type="text" name="tax_id" placeholder="RFC / NIT" onChange={onInputChange} />
            <input value={fiscal_address} type="text" name="fiscal_address" placeholder="Dirección Fiscal" onChange={onInputChange} />
            <input value={address} type="text" name="address" placeholder="Dirección" onChange={onInputChange} />
            <input value={city} type="text" name="city" placeholder="Ciudad" onChange={onInputChange} />
            <input value={state} type="text" name="state" placeholder="Estado" onChange={onInputChange} />
            <input value={country} type="text" name="country" placeholder="País" onChange={onInputChange} />
            <input value={phone} type="tel" name="phone" placeholder="Teléfono" onChange={onInputChange} />
            <input value={email} type="email" name="email" placeholder="Email" onChange={onInputChange} />
            <input value={google_maps_embed_url} type="text" name="google_maps_embed_url" placeholder="Google Maps Embed URL" onChange={onInputChange} />
            <br />
            <img className="h-auto w-[200px]" src={image} alt="" />
            <input type="file" name="new_image" accept="image/*" onChange={e => {
                handleFileChange(e, ({ file, image }) => {
                    setFormState({
                        ...form,
                        image,
                        new_image: file,
                    });
                })
            }} />

            <br /><br />
            <hr />
            <br />

            <h3>Horarios</h3>
            {schedules.map((sch, idx) => {
                if (sch?.id) {
                    handleScheduleChange(idx, 'id', sch.id);
                }

                return (
                    <div key={idx} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
                        <select value={sch.day} onChange={e => handleScheduleChange(idx, 'day', parseInt(e.target.value))}>
                            {days.map((day, idx) => (
                                <option key={day} value={idx}>{day}</option>
                            ))}
                        </select>

                        {!sch.is_closed ? (
                            <input type="text" value={sch.shift_name} onChange={e => handleScheduleChange(idx, 'shift_name', e.target.value)} placeholder="Nombre del turno" />
                        ) : ""}

                        <input type="time" value={sch.open_time} onChange={e => handleScheduleChange(idx, 'open_time', e.target.value)} />
                        <input type="time" value={sch.close_time} onChange={e => handleScheduleChange(idx, 'close_time', e.target.value)} />

                        <label>
                            <input type="checkbox" checked={sch.is_closed} onChange={e => handleScheduleChange(idx, 'is_closed', e.target.checked)} />
                            Cerrado
                        </label>

                        <button type="button" onClick={() => removeSchedule(idx)}>Eliminar</button>
                    </div>
                )
            })}

            <button type="button" onClick={addSchedule}>Agregar horario</button>

            <br /><br />
            <hr />
            <br />

            <h3>Categorias de Producto</h3>
            {categories.map((cat, idx) => (
                <div key={idx} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
                    <input placeholder="Nombre" type="text" value={cat.name} onChange={e => handleCategoryChange(idx, 'name', e.target.value)} />
                    <textarea placeholder="Descripción" value={cat.description} onChange={e => handleCategoryChange(idx, 'description', e.target.value)} />

                    <img className="h-auto w-[100px]" src={cat.image?.startsWith("/") ? `${ENVS.BACKEND_URL}${cat.image}` : cat.image} alt="" />
                    <input type="file" name="new_image" accept="image/*" onChange={e => {
                        handleFileChange(e, ({ file, image }) => {
                            handleCategoryChange(idx, 'image', image);
                            handleCategoryChange(idx, 'new_image', file);
                        })
                    }} />

                    <button type="button" onClick={() => removeCategory(idx)}>Eliminar</button>
                </div>
            ))}

            <button type="button" onClick={addCategory}>Agregar categoria</button>

            <br /><br />
            <hr />
            <br />

            <h3>Productos</h3>
            {products.map((prod, idx) => (
                <div key={idx} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
                    <input placeholder="Nombre" type="text" value={prod.name} onChange={e => handleProductChange(idx, 'name', e.target.value)} />
                    <textarea placeholder="Descripción" value={prod.description} onChange={e => handleProductChange(idx, 'description', e.target.value)} />
                    <input placeholder="Precio" type="number" value={prod.price} onChange={e => handleProductChange(idx, 'price', e.target.value)} />

                    <img className="h-auto w-[100px]" src={prod.image?.startsWith("/") ? `${ENVS.BACKEND_URL}${prod.image}` : prod.image} alt="" />
                    <input type="file" name="new_image" accept="image/*" onChange={e => {
                        handleFileChange(e, ({ file, image }) => {
                            handleProductChange(idx, 'image', image);
                            handleProductChange(idx, 'new_image', file);
                        })
                    }} /> <br />

                    <select value={prod.category ? prod.category : ""} onChange={e => handleProductChange(idx, 'category', e.target.value)}>
                        <option value="">Selecciona una categoría</option>
                        {categories.map((cat, catIdx) => (
                            <option key={catIdx} value={cat.name}>{cat.name}</option>
                        ))}
                    </select><br />

                    <label>
                        <input type="checkbox" checked={prod.is_available} onChange={e => handleProductChange(idx, 'is_available', e.target.checked)} />
                        Disponible
                    </label><br />

                    <label>
                        <input type="checkbox" checked={prod.is_featured} onChange={e => handleProductChange(idx, 'is_featured', e.target.checked)} />
                        Destacado
                    </label><br />

                    <label>
                        <input type="checkbox" checked={prod.is_recommended} onChange={e => handleProductChange(idx, 'is_recommended', e.target.checked)} />
                        Recomendado
                    </label><br />

                    <label>
                        <input type="checkbox" checked={prod.is_new} onChange={e => handleProductChange(idx, 'is_new', e.target.checked)} />
                        Nuevo
                    </label><br />

                    <button type="button" onClick={() => removeProduct(idx)}>Eliminar</button>
                </div>
            ))}

            <button type="button" onClick={addProduct}>Agregar producto</button>

            <br /><br />
            <hr />
            <br />

            <h3>Acciones</h3>
            <button type="submit">Editar restaurante</button>
            <button type="button" onClick={deleteRestaurantAction}>Borrar restaurante</button>
        </form>
    );
};
