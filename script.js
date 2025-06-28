class Tamagotchi {
    constructor(name) {
        this.name = name || "Tammy";
        this.birthDate = new Date();
        this.lastUpdate = new Date();
        this.hunger = 50;
        this.happiness = 70;
        this.energy = 80;
        this.cleanliness = 90;
        this.state = "happy";
        this.isSleeping = false;
        this.age = 0;
        this.weight = 5;
        this.stage = "egg"; // egg, baby, adult
        this.isAlive = true;
    }
    
    update() {
        const now = new Date();
        const hoursPassed = (now - this.lastUpdate) / (1000 * 60 * 60);
        
        if (this.isAlive) {
            // Actualizar estadísticas basadas en el tiempo
            if (!this.isSleeping) {
                this.hunger = Math.min(100, Math.max(0, this.hunger + hoursPassed * 5));
                this.happiness = Math.min(100, Math.max(0, this.happiness - hoursPassed * 3));
                this.cleanliness = Math.min(100, Math.max(0, this.cleanliness - hoursPassed * 2));
                this.energy = Math.min(100, Math.max(0, this.energy - hoursPassed * 4));
            } else {
                this.energy = Math.min(100, Math.max(0, this.energy + hoursPassed * 10));
                this.hunger = Math.min(100, Math.max(0, this.hunger + hoursPassed * 2));
            }
            
            // Actualizar edad
            this.age = (now - this.birthDate) / (1000 * 60 * 60 * 24); // en días
            
            // Evolución
            if (this.age >= 3 && this.stage === "egg") {
                this.stage = "baby";
            } else if (this.age >= 7 && this.stage === "baby") {
                this.stage = "adult";
            }
            
            // Verificar muerte
            if (this.hunger >= 100 || this.happiness <= 0 || this.energy <= 0) {
                this.isAlive = false;
                this.state = "dead";
            } else {
                // Actualizar estado
                if (this.isSleeping) {
                    this.state = "sleepy";
                } else if (this.hunger > 70) {
                    this.state = "hungry";
                } else if (this.happiness < 30) {
                    this.state = "sad";
                } else if (this.cleanliness < 20) {
                    this.state = "dirty";
                } else {
                    this.state = "happy";
                }
            }
        }
        
        this.lastUpdate = now;
    }
    
    feed() {
        if (!this.isAlive) return false;
        this.hunger = Math.max(0, this.hunger - 30);
        this.weight = Math.min(20, this.weight + 1);
        this.update();
        return true;
    }
    
    play() {
        if (!this.isAlive || this.isSleeping) return false;
        this.happiness = Math.min(100, this.happiness + 20);
        this.energy = Math.max(0, this.energy - 15);
        this.hunger = Math.min(100, this.hunger + 10);
        this.update();
        return true;
    }
    
    sleep() {
        if (!this.isAlive) return false;
        this.isSleeping = !this.isSleeping;
        this.update();
        return true;
    }
    
    clean() {
        if (!this.isAlive) return false;
        this.cleanliness = 100;
        this.update();
        return true;
    }
    
    revive() {
        if (this.isAlive) return false;
        this.isAlive = true;
        this.hunger = 50;
        this.happiness = 50;
        this.energy = 50;
        this.cleanliness = 50;
        this.state = "happy";
        this.isSleeping = false;
        this.update();
        return true;
    }
}

// Variables globales
let pet = null;
let tg = null;

// Inicializar la aplicación
function initApp() {
    tg = window.Telegram.WebApp;
    tg.expand();
    
    // Cargar mascota guardada o mostrar formulario de creación
    const savedPet = localStorage.getItem('tamagotchi');
    if (savedPet) {
        const petData = JSON.parse(savedPet);
        pet = new Tamagotchi(petData.name);
        Object.assign(pet, petData);
        pet.update();
        renderPet();
    } else {
        showInitForm();
    }
    
    // Configurar botones
    document.getElementById('feed-btn').addEventListener('click', () => {
        if (pet.feed()) {
            showMessage("🍔 Has alimentado a tu Tamagotchi!");
            renderPet();
        }
    });
    
    document.getElementById('play-btn').addEventListener('click', () => {
        if (pet.play()) {
            showMessage("⚽ Has jugado con tu Tamagotchi!");
            renderPet();
        }
    });
    
    document.getElementById('sleep-btn').addEventListener('click', () => {
        if (pet.sleep()) {
            const action = pet.isSleeping ? "dormido" : "despertado";
            showMessage(`🛌 Has ${action} a tu Tamagotchi!`);
            renderPet();
        }
    });
    
    document.getElementById('clean-btn').addEventListener('click', () => {
        if (pet.clean()) {
            showMessage("🚿 Has limpiado a tu Tamagotchi!");
            renderPet();
        }
    });
    
    document.getElementById('revive-btn').addEventListener('click', () => {
        if (pet.revive()) {
            showMessage("💖 Has revivido a tu Tamagotchi!");
            renderPet();
        }
    });
    
    document.getElementById('create-btn').addEventListener('click', createPet);
}

function showInitForm() {
    document.getElementById('init-form').classList.remove('hidden');
    document.querySelector('.pet-container').classList.add('hidden');
    document.querySelector('.stats').classList.add('hidden');
    document.querySelector('.info').classList.add('hidden');
    document.querySelector('.actions').classList.add('hidden');
}

function createPet() {
    const nameInput = document.getElementById('pet-name-input');
    const name = nameInput.value.trim() || "Tammy";
    
    pet = new Tamagotchi(name);
    localStorage.setItem('tamagotchi', JSON.stringify(pet));
    
    document.getElementById('init-form').classList.add('hidden');
    document.querySelector('.pet-container').classList.remove('hidden');
    document.querySelector('.stats').classList.remove('hidden');
    document.querySelector('.info').classList.remove('hidden');
    document.querySelector('.actions').classList.remove('hidden');
    
    renderPet();
}

function renderPet() {
    if (!pet) return;
    
    pet.update();
    localStorage.setItem('tamagotchi', JSON.stringify(pet));
    
    // Actualizar UI
    document.getElementById('pet-name').textContent = pet.name;
    document.getElementById('pet-state').textContent = getStateText(pet.state);
    document.getElementById('pet-state').className = `state ${pet.state}`;
    
    // Actualizar barras de estadísticas
    updateBar('hunger', pet.hunger);
    updateBar('happiness', pet.happiness);
    updateBar('energy', pet.energy);
    updateBar('cleanliness', pet.cleanliness);
    
    // Actualizar información
    document.getElementById('info-name').textContent = pet.name;
    document.getElementById('info-age').textContent = pet.age.toFixed(1);
    document.getElementById('info-weight').textContent = pet.weight;
    document.getElementById('info-state').textContent = getStageText(pet.stage);
    
    // Actualizar mascota visual
    const petElement = document.getElementById('pet');
    petElement.className = 'pet';
    
    if (!pet.isAlive) {
        petElement.classList.add('dead-pet');
        document.getElementById('revive-btn').classList.remove('hidden');
    } else {
        petElement.classList.add(pet.stage);
        
        // Animaciones según estado
        if (pet.state === 'happy') {
            petElement.classList.add('happy-animation');
        } else if (pet.state === 'sad') {
            petElement.classList.add('sad-animation');
        }
    }
    
    // Mostrar/ocultar botones según estado
    document.getElementById('sleep-btn').textContent = pet.isSleeping ? "⏰ Despertar" : "🛌 Dormir";
}

function updateBar(id, value) {
    const bar = document.getElementById(`${id}-bar`);
    const text = document.getElementById(`${id}-value`);
    
    bar.style.width = `${value}%`;
    text.textContent = `${Math.round(value)}%`;
    
    // Cambiar color según el valor
    if (value > 70) {
        bar.style.backgroundColor = value === 100 ? '#f44336' : '#ff9800';
    } else if (value < 30) {
        bar.style.backgroundColor = '#f44336';
    } else {
        bar.style.backgroundColor = '#4caf50';
    }
}

function getStateText(state) {
    const states = {
        happy: '😊 Feliz',
        hungry: '🍔 Hambriento',
        sad: '😢 Triste',
        sleepy: '😴 Durmiendo',
        dirty: '💩 Sucio',
        dead: '💀 Muerto'
    };
    return states[state] || state;
}

function getStageText(stage) {
    const stages = {
        egg: 'Huevo',
        baby: 'Bebé',
        adult: 'Adulto'
    };
    return stages[stage] || stage;
}

function showMessage(text) {
    if (tg && tg.showAlert) {
        tg.showAlert(text);
    } else {
        alert(text);
    }
}

// Iniciar la aplicación cuando se cargue la página
window.addEventListener('DOMContentLoaded', initApp);