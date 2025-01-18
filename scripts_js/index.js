const productMainCategories = {
    'home & kitchen': 'Дом & Кухня',
    'tv, audio & cameras': 'ТВ, аудио & камеры',
    'sports & fitness': 'Спорт & фитнес',
    'beauty & health': 'Красота & здоровье'
}

document.addEventListener('DOMContentLoaded', async () => {
    const products = await fetchProducts();
    await populateCards(products.goods);
    await displayPages(products._pagination);

    document.getElementById('sort_order').addEventListener('change', async () => {
        const url = new URL(window.location);
        url.searchParams.set('sort_order', document.getElementById('sort_order').value);
        window.history.pushState({}, '', url);
        location.reload();
    });
});

async function fetchProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') ? urlParams.get('page') : 1;
    const perPage = urlParams.get('per_page') ? urlParams.get('per_page') : 12;
    const sortOrder = urlParams.get('sort_order') ? urlParams.get('sort_order') : 'rating_desc';
    document.getElementById('sort_order').value = sortOrder;
    const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=b82a7396-638e-4eef-82fc-1f759b30701b&page=${page}&per_page=${perPage}&sort_order=${sortOrder}`);
    return await response.json();
}

async function populateCards(products) {
    const container = document.querySelector('.product-container');
    products.forEach(async (product) => {
        const card = await createCard(product);
        container.appendChild(card);
    });    
}

async function createCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');

    const img = document.createElement('img');
    img.src = product.image_url;
    card.appendChild(img);

    const infoDiv = document.createElement('div');
    card.appendChild(infoDiv);

    const title = document.createElement('h2');
    title.textContent = product.name;
    infoDiv.appendChild(title);

    const priceDiv = document.createElement('div');
    infoDiv.appendChild(priceDiv);
    if (product.discount_price !== null) {
        const price = document.createElement('p');
        price.textContent = `${product.discount_price} ₽`;
        priceDiv.appendChild(price);

        const discountPrice = document.createElement('p');
        discountPrice.textContent = `${product.actual_price} ₽`;
        priceDiv.appendChild(discountPrice);

        const discountPercent = document.createElement('p');
        discountPercent.textContent = `${-Math.round((1 - product.discount_price / product.actual_price) * 100)}%`;
        priceDiv.appendChild(discountPercent);
    } else {
        const price = document.createElement('p');
        price.textContent = `${product.actual_price} ₽`;
        priceDiv.appendChild(price);
    }

    const rating = document.createElement('p');
    rating.textContent = `Рейтинг: ${product.rating}`;
    infoDiv.appendChild(rating);

    const button = document.createElement('button');
    const handleProductClick = () => addToCart(product);
    button.addEventListener(`click`, handleProductClick);
    button.textContent = 'Добавить';
    infoDiv.appendChild(button);
    
    return card;
}

async function displayPages(pagination) {
    const urlParams = new URLSearchParams(window.location.search);
    const sortOrder = urlParams.get('sort_order') ? urlParams.get('sort_order') : 'rating_desc';
    const pagesContainer = document.getElementById('pages-container');
    const pagesCount = Math.ceil(pagination.total_count / pagination.per_page);
    
    for (let i = 1; i <= pagesCount; i++) {
        const pageLink = document.createElement('a');
        pageLink.textContent = i;
        pageLink.href = `index.html?page=${i}&per_page=${pagination.per_page}&sort_order=${sortOrder}`;

        if (i === pagination.current_page) {
            pageLink.id = 'active-page';
        } else {
            pageLink.classList.add('page');
        }

        pagesContainer.appendChild(pageLink);
    }
}

async function addToCart (product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!cart.includes(product.id)) {
        cart.push(product.id);
        localStorage.setItem('cart', JSON.stringify(cart));
        await displayNotification(`Товар ${product.name} добавлен в корзину`);
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