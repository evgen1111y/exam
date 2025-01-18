document.addEventListener('DOMContentLoaded', async () => {
    const ordersTable = document.querySelector('#orders tbody');
    const products = await fetchProducts();
    const orders = await fetchOrders();
    await fillTable(ordersTable, products, orders);
})

async function fetchProducts() {
    const response = await fetch('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=8b8bb635-cc99-4152-92ae-265cca506574');
    return await response.json();
}

async function fetchOrders() {
    const response = await fetch('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=8b8bb635-cc99-4152-92ae-265cca506574');
    return await response.json();
}

async function fillTable(table, products, orders) {
    for (let i = 1; i <= orders.length; i++) {
        await pushToTable(table, i, orders[i - 1], products);
    }
}

async function pushToTable(table, number, order, products) {
    let selectedProductsNames = '';
    let orderPrice = 0;
    let deliveryPrice = 200;

    products.forEach((product) => {
        if (order.good_ids.includes(product.id)) {
            selectedProductsNames += selectedProductsNames.length === 0 ? product.name : '?' + product.name;
            orderPrice += product.discount_price ? product.discount_price : product.actual_price;
        }
    });

    const ddate = new Date(order.delivery_date);
    const dinterval = order.delivery_interval;

    if (orderPrice === 0) {
        deliveryPrice = 0;
    } else if (ddate.getDay() === 0 || ddate.getDay() === 6) {
        deliveryPrice += 300;
    } else if (dinterval === '18:00-22:00') {
        deliveryPrice += 200;
    }

    let newRow = table.insertRow();

    let numCell = newRow.insertCell();
    let numText = document.createTextNode(number);
    numCell.appendChild(numText);

    const date = order['created_at'].split('T')[0].split('-');
    const time = order['created_at'].split('T')[1].substring(0, 5);

    let dateCell = newRow.insertCell();
    let dateText = document.createTextNode(`${date[2]}.${date[1]}.${date[0]} ${time}`);
    dateCell.appendChild(dateText);

    let productsCell = newRow.insertCell();
    selectedProductsNames.split('?').forEach((name) => {
        let productsText = document.createElement('p');
        productsText.textContent = name;
        productsCell.appendChild(productsText);
    });

    let priceCell = newRow.insertCell();
    let priceText = document.createTextNode(orderPrice + deliveryPrice + '₽');
    priceCell.appendChild(priceText);

    let timeCell = newRow.insertCell();
    let timeText = document.createTextNode(`${formatDate(order.delivery_date)} ${order.delivery_interval}`);
    timeCell.appendChild(timeText);

    let actionsCell = newRow.insertCell();
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('actions');

    const readButton = document.createElement('button');
    const readModal = new Modal('readModal', readButton, products, order);
    const readImg = document.createElement('img');
    readImg.src = 'icons/read.svg';
    readButton.appendChild(readImg);

    const editButton = document.createElement('button');
    const editModal = new Modal('editModal', editButton, products, order);
    const editImg = document.createElement('img');
    editImg.src = 'icons/edit.svg';
    editButton.appendChild(editImg);

    const deleteButton = document.createElement('button');
    const deleteModal = new Modal('deleteModal', deleteButton, products, order);
    const deleteImg = document.createElement('img');
    deleteImg.src = 'icons/delete.svg';
    deleteButton.appendChild(deleteImg);

    actionsDiv.appendChild(readButton);
    actionsDiv.appendChild(editButton);
    actionsDiv.appendChild(deleteButton);

    actionsCell.appendChild(actionsDiv);
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
}

async function readOrder(products, order) {
    let selectedProductsNames = '';
    let orderPrice = 0;
    let deliveryPrice = 200;

    products.forEach((product) => {
        if (order.good_ids.includes(product.id)) {
            selectedProductsNames += selectedProductsNames.length === 0 ? product.name : ', ' + product.name;
            orderPrice += product.discount_price ? product.discount_price : product.actual_price;
        }
    });

    const ddate = new Date(order.delivery_date);
    const dinterval = order.delivery_interval;

    if (orderPrice === 0) {
        deliveryPrice = 0;
    } else if (ddate.getDay() === 0 || ddate.getDay() === 6) {
        deliveryPrice += 300;
    } else if (dinterval === '18:00-22:00') {
        deliveryPrice += 200;
    }

    const date = order.created_at.split('T')[0].split('-');
    const time = order.created_at.split('T')[1].substring(0, 5);

    document.querySelector('#readModal .modal-body').innerHTML = `
        <div>
            <p>Дата оформления</p>
            <p>${date[2]}.${date[1]}.${date[0]} ${time}</p>
        </div>
        <div>
            <p>Имя получателя</p>
            <p>${order.full_name}</p>
        </div>
        <div>
            <p>Номер телефона</p>
            <p>${order.phone}</p>
        </div>
        <div>
            <p>Email</p>
            <p>${order.email}</p>
        </div>
        <div>
            <p>Адрес доставки</p>
            <p>${order.delivery_address}</p>
        </div>
        <div>
            <p>Дата доставки</p>
            <p>${formatDate(order.delivery_date)}</p>
        </div>
        <div>
            <p>Время доставки</p>
            <p>${order.delivery_interval}</p>
        </div>
        <div><p>Состав заказа</p></div>
        <p>${selectedProductsNames}</p>
        <div>
            <p>Стоимость</p>
            <p>${orderPrice + deliveryPrice} ₽</p>
        </div>
        <div><p>Комментарий</p></div>
        <p>${order['comment'] !== null ? order['comment'] : '-'}</p>
    `
}

async function editOrder(products, order) {
    let selectedProductsNames = '';
    let orderPrice = 0;
    let deliveryPrice = 200;

    products.forEach((product) => {
        if (order.good_ids.includes(product.id)) {
            selectedProductsNames += selectedProductsNames.length === 0 ? product.name : ', ' + product.name;
            orderPrice += product.discount_price ? product.discount_price : product.actual_price;
        }
    });

    const ddate = new Date(order.delivery_date);
    const dinterval = order.delivery_interval;

    if (orderPrice === 0) {
        deliveryPrice = 0;
    } else if (ddate.getDay() === 0 || ddate.getDay() === 6) {
        deliveryPrice += 300;
    } else if (dinterval === '18:00-22:00') {
        deliveryPrice += 200;
    }

    const date = order.created_at.split('T')[0].split('-');
    const time = order.created_at.split('T')[1].substring(0, 5);
    
    document.querySelector('#editModal .modal-body').innerHTML = `
        <form id="order-form">
            <div>
                <p>Дата оформления</p>
                <p>${date[2]}.${date[1]}.${date[0]} ${time}</p>
            </div>
            <div>
                <label for="full_name">Имя получателя</label>
                <input type="text" id="full_name" name="full_name" value="${order.full_name}" required>
            </div>
             <div>
                <label for="phone">Номер телефона</label>
                <input type="tel" id="phone" name="phone" value="${order.phone}" required>
            </div>
            <div>
                <label for="email">Email</label>
                <input type="email" id="email" name="email" value="${order.email}" required>
            </div>
            <div>
                <label for="delivery_address">Адрес доставки</label>
                <input type="text" id="delivery_address" name="delivery_address" value="${order.delivery_address}" required>
            </div>
            <div>
                <label for="delivery_date">Дата доставки</label>
                <input type="date" id="delivery_date" name="delivery_date" min="{{today}}" value="${order.delivery_date}" required>
            </div>
            <div>
                <label for="delivery_interval">Временной интервал доставки</label>
                <select id="delivery_interval" name="delivery_interval" required>
                    <option value="08:00-12:00"${order.delivery_interval === '08:00-12:00' ? ' selected="selected"' : ''}>08:00-12:00</option>
                    <option value="12:00-14:00"${order.delivery_interval === '12:00-14:00' ? ' selected="selected"' : ''}>12:00-14:00</option>
                    <option value="14:00-18:00"${order.delivery_interval === '14:00-18:00' ? ' selected="selected"' : ''}>14:00-18:00</option>
                    <option value="18:00-22:00"${order.delivery_interval === '18:00-22:00' ? ' selected="selected"' : ''}>18:00-22:00</option>
                </select>
            </div>
            <div><p>Состав заказа</p></div>
            <p>${selectedProductsNames}</p>
            <div>
                <p>Стоимость</p>
                <p>${orderPrice + deliveryPrice} ₽</p>
            </div>
            <div><p>Комментарий</p></div>
            <textarea id="comment" name="comment" rows="3">${order['comment'] !== null ? order['comment'] : '-'}</textarea>
        </form>
    `

    document.getElementById('saveButton').addEventListener('click', async () => {
        const form = document.getElementById('order-form');
        const formData = new FormData(form);
        order.good_ids.forEach(async (id) => {
            formData.append('good_ids', id);
        });
        formData.set('delivery_date', formatDate(document.getElementById('delivery_date').value));

        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${order.id}?api_key=8b8bb635-cc99-4152-92ae-265cca506574`, {
            method: 'PUT',
            body: formData
        });
        
        if (response.status === 200) {
            await displayNotification('Заказ успешно изменен');
            setTimeout(onEditOrder, 1500);
        } else {
            await displayNotification('Ошибка изменения заказа');
        }
    });
}

async function onEditOrder() {
    location.reload();
}

async function deleteOrder(order) {
    const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${order.id}?api_key=8b8bb635-cc99-4152-92ae-265cca506574`, {
        method: 'DELETE'
    });

    if (response.status === 200) {
        location.reload();
    } else {
        await displayNotification('Не удалось удалить заказ');
    }
}

async function displayNotification(message) {
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.style.display = 'block';

    const notification = document.createElement('div');
    const notificationMessage = document.createElement('p');
    notificationMessage.textContent = message;
    notification.appendChild(notificationMessage);

    const notificationButton = document.createElement('button');
    const buttonImg = document.createElement('img');
    buttonImg.src = 'icons/close.svg';
    notificationButton.appendChild(buttonImg);
    notificationButton.addEventListener('click', function () {
        notification.parentNode.removeChild(notification);
        if (notificationContainer.innerHTML === '') {
            notificationContainer.display = 'none';
        }
    });
    notification.appendChild(notificationButton);
    notificationContainer.appendChild(notification);
}

class Modal {
    constructor(modalId, openButton, products, order) {
        this.modal = document.getElementById(modalId);
        this.body = document.querySelector(`#${modalId} .modal-body`);
        this.buttons = document.querySelector(`#${modalId} .modal-buttons`);
        this.openButton = openButton;
        this.closeButton = this.modal.querySelector('.close');

        if (this.buttons.querySelector('.cancel')) {
            this.buttons.querySelector('.cancel').addEventListener('click', () => this.close());
        }

        this.openButton.addEventListener('click', () => this.open(products, order));
        this.closeButton.addEventListener('click', () => this.close());

        document.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
    }

    open(products, order) {
        this.modal.style.display = 'block';

        if (this.buttons.querySelector('#deleteButton')) {
            document.getElementById('deleteButton').addEventListener('click', () => deleteOrder(order));
        } else if (this.buttons.querySelector('#saveButton')) {
            editOrder(products, order);
        } else {
            readOrder(products, order);
        }
    }

    close() {
        this.modal.style.display = 'none';
    }
}
