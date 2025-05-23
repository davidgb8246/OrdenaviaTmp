import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createRestaurant } from "../../Redux/management/thunks";
import { useForm } from "../../hooks/useForm";



const defaultSchedule = {
    day: 0,
    shift_name: "",
    open_time: "00:00",
    close_time: "00:00",
    is_closed: false,
};

const days = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

let schedulesArray = Array(7).fill({ ...defaultSchedule, is_closed: true });
schedulesArray = schedulesArray.map((schedule, index) => ({
    ...schedule,
    day: index,
}));

export const CreateRestaurant = () => {
    const { onInputChange, errorMessage, ...form } = useForm({
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
        errorMessage: undefined,
    });

    const { name, description, legal_name, commercial_name, tax_id, fiscal_address, image,
        address, city, state, country, phone, email, google_maps_embed_url } = form;

    const [schedules, setSchedules] = useState(schedulesArray);
    const dispatch = useDispatch();

    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...schedules];
        newSchedules[index][field] = value;
        setSchedules(newSchedules);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onInputChange({ target: { name: "image", value: file } });
        }
    };

    const addSchedule = () => setSchedules([...schedules, { ...defaultSchedule }]);
    const removeSchedule = (index) => setSchedules(schedules.filter((_, i) => i !== index));

    useEffect(() => {
        setTimeout(() => {
            onInputChange({ target: { name: "errorMessage", value: undefined } });
        }, 2000);
    }, [errorMessage]);


    const onSubmit = (e) => {
        e.preventDefault();

        const fields = [
            [name, "Nombre"],
            [description, "Descripción"],
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
                onInputChange({ target: { name: "errorMessage", value: `El campo ${fieldName} es requerido` } });
                return;
            }
        }

        if (!google_maps_embed_url.trim().includes("embed")) {
            onInputChange({ target: { name: "errorMessage", value: "La URL de Google Maps no es válida" } });
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
                onInputChange({ target: { name: "errorMessage", value: `Falta definir un horario para ${days[i]}` } });
                return;
            }
        }

        for (let day in dayGroups) {
            const entries = dayGroups[day];
            const closed = entries.filter(s => s.is_closed);
            const open = entries.filter(s => !s.is_closed);

            if (closed.length > 0 && entries.length > 1) {
                onInputChange({ target: { name: "errorMessage", value: `En ${days[day]}, no se pueden mezclar horarios cerrados con abiertos.` } });
                return;
            }

            for (let i = 0; i < open.length; i++) {
                const a = open[i];

                if (a.open_time >= a.close_time) {
                    onInputChange({ target: { name: "errorMessage", value: `En ${days[day]}, la hora de apertura debe ser menor que la de cierre.` } });
                    return;
                }

                for (let j = i + 1; j < open.length; j++) {
                    const b = open[j];

                    const conflict =
                        (a.open_time < b.close_time && a.close_time > b.open_time);

                    if (conflict) {
                        onInputChange({ target: { name: "errorMessage", value: `Conflicto de horarios en ${days[day]}.` } });
                        return;
                    }
                }
            }
        }

        const formData = new FormData();
        formData.append('restaurant', JSON.stringify({ ...form }));
        formData.append('schedules', JSON.stringify(schedules));
        formData.append('image', image);

        dispatch(createRestaurant(formData));
    };

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

            <input type="text" name="name" placeholder="Nombre" onChange={onInputChange} />
            <textarea name="description" placeholder="Descripción" onChange={onInputChange} rows="4" style={{ resize: 'vertical' }} />
            <input type="text" name="legal_name" placeholder="Razón Social" onChange={onInputChange} />
            <input type="text" name="commercial_name" placeholder="Nombre Comercial" onChange={onInputChange} />
            <input type="text" name="tax_id" placeholder="RFC / NIT" onChange={onInputChange} />
            <input type="text" name="fiscal_address" placeholder="Dirección Fiscal" onChange={onInputChange} />
            <input type="text" name="address" placeholder="Dirección" onChange={onInputChange} />
            <input type="text" name="city" placeholder="Ciudad" onChange={onInputChange} />
            <input type="text" name="state" placeholder="Estado" onChange={onInputChange} />
            <input type="text" name="country" placeholder="País" onChange={onInputChange} />
            <input type="tel" name="phone" placeholder="Teléfono" onChange={onInputChange} />
            <input type="email" name="email" placeholder="Email" onChange={onInputChange} />
            <input type="text" name="google_maps_embed_url" placeholder="Google Maps Embed URL" onChange={onInputChange} />
            <br />
            <input type="file" name="image" accept="image/*" onChange={handleFileChange} />



            <h3>Horarios</h3>
            {schedules.map((sch, idx) => (
                <div key={idx} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
                    <select value={sch.day} onChange={e => handleScheduleChange(idx, 'day', e.target.value)}>
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
            ))}

            <button type="button" onClick={addSchedule}>Agregar horario</button>
            <br /><br />
            <button type="submit">Crear restaurante</button>
        </form>
    );
};
