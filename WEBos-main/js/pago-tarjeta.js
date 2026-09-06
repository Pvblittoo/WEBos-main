document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('card-number-input');
    const nameInput = document.getElementById('card-name-input');
    const monthInput = document.getElementById('card-month-input');
    const yearInput = document.getElementById('card-year-input');
    const cvvInput = document.getElementById('card-cvv-input');
    const numberDisplay = document.getElementById('card-number-display');
    const nameDisplay = document.getElementById('card-name-display');
    const expiryDisplay = document.getElementById('card-expiry-display');
    const cvvDisplay = document.getElementById('card-cvv-display');
    const cardInner = document.getElementById('card-inner');

    numberInput?.addEventListener('input', event => {
        const value = event.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        event.target.value = value;
        numberDisplay.textContent = value || '#### #### #### ####';
    });
    nameInput?.addEventListener('input', event => {
        nameDisplay.textContent = event.target.value.toUpperCase() || 'NOMBRE COMPLETO';
    });
    const updateExpiry = () => {
        expiryDisplay.textContent = `${monthInput.value || 'MM'}/${yearInput.value || 'YY'}`;
    };
    monthInput?.addEventListener('change', updateExpiry);
    yearInput?.addEventListener('change', updateExpiry);
    cvvInput?.addEventListener('input', event => {
        event.target.value = event.target.value.replace(/\D/g, '');
        cvvDisplay.textContent = event.target.value;
    });
    cvvInput?.addEventListener('focus', () => { cardInner.style.transform = 'rotateY(180deg)'; });
    cvvInput?.addEventListener('blur', () => { cardInner.style.transform = 'rotateY(0deg)'; });
});
