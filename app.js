// Esta versión simplificada usa localStorage para persistencia
// En una implementación real, podrías usar la API de Telegram para guardar datos

// Inicializar la MiniApp de Telegram
function initTelegramApp() {
    const tg = window.Telegram.WebApp;
    
    // Mostrar la versión de la MiniApp en consola
    console.log('Telegram WebApp version:', tg.version);
    
    // Expandir la MiniApp para ocupar toda la pantalla
    tg.expand();
    
    // Configurar el color de fondo del header de Telegram
    tg.headerColor = '#4CAF50';
    tg.backgroundColor = '#f5f5f5';
    
    // Configurar el botón principal (si es necesario)
    tg.MainButton.setText('Mi Tamagotchi');
    tg.MainButton.onClick(() => {
        tg.showAlert('¡Cuida bien de tu Tamagotchi!');
    });
    
    return tg;
}

// Guardar datos en el almacenamiento de Telegram
function saveDataToTelegram(data) {
    const tg = window.Telegram.WebApp;
    if (tg && tg.sendData) {
        tg.sendData(JSON.stringify(data));
        return true;
    }
    return false;
}

// Cargar datos desde Telegram (simulado con localStorage)
function loadDataFromTelegram() {
    const tg = window.Telegram.WebApp;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const userId = tg.initDataUnsafe.user.id;
        const savedData = localStorage.getItem(`tamagotchi_${userId}`);
        return savedData ? JSON.parse(savedData) : null;
    }
    return null;
}