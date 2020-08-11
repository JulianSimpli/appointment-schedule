let db;
const form = document.querySelector('form'),
    name = document.querySelector('#name'),
    place = document.querySelector('#place'),
    phone = document.querySelector('#phone'),
    date = document.querySelector('#date'),
    hour = document.querySelector('#hour'),
    desc = document.querySelector('#desc'),
    appointment = document.querySelector('#appointment'),
    manage = document.querySelector('#manage');

document.addEventListener('DOMContentLoaded', () => {
    // create db
    let dbCreate = window.indexedDB.open('appointments', 1);

    dbCreate.onerror = () => {
        console.log('DB error');
    };
    dbCreate.onsuccess = () => {
        db = dbCreate.result;
        showAppointments();
    }
    // This function runs only once when the database is created
    dbCreate.onupgradeneeded = (e) => {
        // e.target.result -> db
        // define ObjectStore
        // keyPath -> db index
        let objectStore = e.target.result.createObjectStore('appointments', { keyPath: 'key', autoIncrement: true });
        // create db indices and fields
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('place', 'place', { unique: false });
        objectStore.createIndex('phone', 'phone', { unique: false });
        objectStore.createIndex('date', 'date', { unique: false });
        objectStore.createIndex('hour', 'hour', { unique: false });
        objectStore.createIndex('desc', 'desc', { unique: false });
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newAppointment = {
        name: name.value,
        place: place.value,
        phone: phone.value,
        date: date.value,
        hour: hour.value,
        desc: desc.value
    };
    let transaction = db.transaction(['appointments'], 'readwrite'),
        objectStore = transaction.objectStore('appointments'),
        request = objectStore.add(newAppointment);

    request.onsuccess = () => form.reset();
    transaction.oncomplete = () => showAppointments();
    transaction.onerror = () => console.log('Error. Appointment not added');
});

function showAppointments() {
    while (appointment.firstChild) {
        appointment.firstChild.remove();
    }
    let objectStore = db.transaction('appointments').objectStore('appointments');

    objectStore.openCursor().onsuccess = (e) => {
        let cursor = e.target.result;
        if (cursor) {
            let appointmentHtml = document.createElement('li'),
                deleteBtn = document.createElement('button');

            appointmentHtml.setAttribute('data-appointment-id', cursor.value.key);
            appointmentHtml.classList.add('list-group-item');
            appointmentHtml.innerHTML = `
                <p class="font-weight-bold">Name: <span class="font-weight-normal">${cursor.value.name}</span></p>
                <p class="font-weight-bold">Place: <span class="font-weight-normal">${cursor.value.place}</span></p>
                <p class="font-weight-bold">Phone: <span class="font-weight-normal">${cursor.value.phone}</span></p>
                <p class="font-weight-bold">Date: <span class="font-weight-normal">${cursor.value.date}</span></p>
                <p class="font-weight-bold">Hour: <span class="font-weight-normal">${cursor.value.hour}</span></p>
                <p class="font-weight-bold">Description: <span class="font-weight-normal">${cursor.value.desc}</span></p>
            `;

            deleteBtn.classList.add('delete', 'btn', 'btn-danger');
            deleteBtn.innerHTML = `<span aria-hidden="true">X</span> Delete`;
            deleteBtn.onclick = (e) => {
                let appointmentId = Number(e.target.parentElement.getAttribute('data-appointment-id')),
                    transaction = db.transaction(['appointments'], 'readwrite'),
                    objectStore = transaction.objectStore('appointments');
                
                objectStore.delete(appointmentId);
                transaction.oncomplete = () => {
                    e.target.parentElement.parentElement.removeChild(e.target.parentElement);
                    showAppointments()
                };
            };

            appointmentHtml.appendChild(deleteBtn);
            appointment.appendChild(appointmentHtml);
            cursor.continue();
        } else {
            if (!appointment.firstChild) {
                manage.textContent = `Add appointments!`;
                let list = document.createElement('p');
                list.classList.add('text-center');
                list.textContent = `No records yet`;
                appointment.appendChild(list);
            } else {
                manage.textContent = `Manage your appointments!`;
            }
        }
    };

}