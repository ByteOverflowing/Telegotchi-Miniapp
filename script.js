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
        this.stage = "egg";
        this.isAlive = true;
        this.money = 100;
        this.inventory = [];
        this.lastEnergyRecovery = new Date();
        this.tapsToday = 0;
        this.lastTapDate = new Date().toDateString();
    }

    update() {
        const now = new Date();
        const hoursPassed = (now - this.lastUpdate) / (1000 * 60 * 60);

        if (now.toDateString() !== this.lastTapDate) {
            this.tapsToday = 0;
            this.lastTapDate = now.toDateString();
        }

        if (this.isAlive) {
            if (!this.isSleeping) {
                this.hunger = Math.min(100, Math.max(0, this.hunger + hoursPassed * 5));
                this.happiness = Math.min(100, Math.max(0, this.happiness - hoursPassed * 3));
                this.cleanliness = Math.min(100, Math.max(0, this.cleanliness - hoursPassed * 2));
                this.energy = Math.min(100, Math.max(0, this.energy - hoursPassed * 4));
            } else {
                this.energy = Math.min(100, Math.max(0, this.energy + hoursPassed * 10));
                this.hunger = Math.min(100, Math.max(0, this.hunger + hoursPassed * 2));
            }

            this.age = (now - this.birthDate) / (1000 * 60 * 60 * 24);

            if (this.age >= 3 && this.stage === "egg") {
                this.stage = "baby";
            } else if (this.age >= 7 && this.stage === "baby") {
                this.stage = "adult";
            }

            if (this.hunger >= 100 || this.happiness <= 0 || this.energy <= 0) {
                this.isAlive = false;
                this.state = "dead";
            } else {
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

    feed(amount = 30) {
        if (!this.isAlive) return false;
        this.hunger = Math.max(0, this.hunger - amount);
        this.weight = Math.min(20, this.weight + (amount / 10));
        return true;
    }

    play() {
        if (!this.isAlive || this.isSleeping) return false;
        this.happiness = Math.min(100, this.happiness + 20);
        this.energy = Math.max(0, this.energy - 15);
        this.hunger = Math.min(100, this.hunger + 10);
        return true;
    }

    sleep() {
        if (!this.isAlive) return false;
        this.isSleeping = !this.isSleeping;
        if (this.isSleeping) this.lastEnergyRecovery = new Date();
        return true;
    }

    clean() {
        if (!this.isAlive) return false;
        this.cleanliness = 100;
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
        return true;
    }

    collectMoney() {
        const now = new Date();
        const hoursPassed = (now - this.lastEnergyRecovery) / (1000 * 60 * 60);
        if (hoursPassed >= 1) {
            this.money += Math.floor(hoursPassed) * 5;
            this.lastEnergyRecovery = now;
            return true;
        }
        return false;
    }

    tap() {
        if (this.tapsToday < 5) {
            this.money += 2;
            this.tapsToday++;
            return true;
        }
        return false;
    }

    buyItem(item) {
        if (this.money >= item.cost) {
            this.money -= item.cost;

            if (item.type === 'food') {
                this.feed(item.hunger || 20);
            } else if (item.type === 'toy') {
                this.happiness = Math.min(100, this.happiness + (item.happiness || 20));
            } else if (item.type === 'collectible') {
                this.inventory.push({
                    name: item.name || 'Item',
                    type: 'collectible',
                    date: new Date()
                });
            }
            return true;
        }
        return false;
    }

    calculateRecoveryTime() {
        if (this.isSleeping) {
            const missingEnergy = 100 - this.energy;
            const minutes = Math.ceil(missingEnergy / 2);
            return minutes;
        }
        return 0;
    }

    work() {
        const earnings = 2;
        this.money += earnings;
        return earnings;
    }

    toJSON() {
        return {
            name: this.name,
            birthDate: this.birthDate.getTime(),
            lastUpdate: this.lastUpdate.getTime(),
            hunger: this.hunger,
            happiness: this.happiness,
            energy: this.energy,
            cleanliness: this.cleanliness,
            state: this.state,
            isSleeping: this.isSleeping,
            age: this.age,
            weight: this.weight,
            stage: this.stage,
            isAlive: this.isAlive,
            money: this.money,
            inventory: this.inventory,
            lastEnergyRecovery: this.lastEnergyRecovery.getTime(),
            tapsToday: this.tapsToday,
            lastTapDate: this.lastTapDate
        };
    }

    static fromJSON(json) {
        const pet = new Tamagotchi(json.name);
        pet.birthDate = new Date(json.birthDate);
        pet.lastUpdate = new Date(json.lastUpdate);
        pet.hunger = json.hunger;
        pet.happiness = json.happiness;
        pet.energy = json.energy;
        pet.cleanliness = json.cleanliness;
        pet.state = json.state;
        pet.isSleeping = json.isSleeping;
        pet.age = json.age;
        pet.weight = json.weight;
        pet.stage = json.stage;
        pet.isAlive = json.isAlive;
        pet.money = json.money || 100;
        pet.inventory = json.inventory || [];
        pet.lastEnergyRecovery = new Date(json.lastEnergyRecovery || Date.now());
        pet.tapsToday = json.tapsToday || 0;
        pet.lastTapDate = json.lastTapDate || new Date().toDateString();
        return pet;
    }
}

let pet = null;
let tg = null;
let workInterval = null;
let workEarnings = 0;
let workProgress = 0;

async function savePetData() {
    if (!pet) return;

    const data = JSON.stringify(pet);
    try {
        if (window.Telegram?.WebApp?.CloudStorage) {
            await Telegram.WebApp.CloudStorage.setItem('tamagotchi', data);
        }
        localStorage.setItem('tamagotchi', data);
    } catch (e) {
        console.error("Error saving data:", e);
    }
}

async function loadPetData() {
    try {
        if (window.Telegram?.WebApp?.CloudStorage) {
            return new Promise((resolve) => {
                Telegram.WebApp.CloudStorage.getItem('tamagotchi', (err, value) => {
                    if (!err && value) {
                        resolve(JSON.parse(value));
                    } else {
                        const localData = localStorage.getItem('tamagotchi');
                        resolve(localData ? JSON.parse(localData) : null);
                    }
                });
            });
        }
        const localData = localStorage.getItem('tamagotchi');
        return localData ? JSON.parse(localData) : null;
    } catch (e) {
        console.error("Error loading data:", e);
        return null;
    }
}

async function renderPet() {
    if (!pet) return;

    pet.update();
    await savePetData();

    // Actualizar toda la UI
    document.getElementById('money').textContent = pet.money;
    document.getElementById('hunger-value').textContent = Math.round(pet.hunger);
    document.getElementById('happiness-value').textContent = Math.round(pet.happiness);
    document.getElementById('energy-value').textContent = Math.round(pet.energy);
    document.getElementById('cleanliness-value').textContent = Math.round(pet.cleanliness);
    
    updateBar('hunger', pet.hunger);
    updateBar('happiness', pet.happiness);
    updateBar('energy', pet.energy);
    updateBar('cleanliness', pet.cleanliness);

    document.getElementById('pet-name').textContent = pet.name;
    document.getElementById('pet-state').textContent = getStateText(pet.state);
    document.getElementById('pet-state').className = `state ${pet.state}`;
    
    document.getElementById('info-name').textContent = pet.name;
    document.getElementById('info-age').textContent = pet.age.toFixed(1);
    document.getElementById('info-weight').textContent = pet.weight;
    document.getElementById('info-state').textContent = getStageText(pet.stage);
    document.getElementById('inventory-count').textContent = pet.inventory.length;
    
    updateRecoveryTime();
    updateTapInfo();
    
    const petElement = document.getElementById('pet');
    petElement.className = 'pet';
    
    if (!pet.isAlive) {
        petElement.classList.add('dead-pet');
        document.getElementById('revive-btn').classList.remove('hidden');
    } else {
        petElement.classList.add(pet.stage);
        
        if (pet.state === 'happy') {
            petElement.classList.add('happy-animation');
        } else if (pet.state === 'sad') {
            petElement.classList.add('sad-animation');
        }
    }
    
    document.getElementById('sleep-btn').textContent = pet.isSleeping ? "⏰ Despertar" : "🛌 Dormir";
}

function startWork() {
    document.getElementById('work-minigame').classList.remove('hidden');
    workEarnings = 0;
    workProgress = 0;
    document.getElementById('work-earned').textContent = '0';
    document.getElementById('work-bar').style.width = '0%';

    document.getElementById('work-click-area').onclick = async () => {
        pet.money += 2;
        workEarnings += 2;
        document.getElementById('work-earned').textContent = workEarnings;
        document.getElementById('money').textContent = pet.money;
        
        workProgress = Math.min(100, workProgress + 15);
        document.getElementById('work-bar').style.width = `${workProgress}%`;
        
        if (workProgress >= 100) {
            pet.money += 5;
            workEarnings += 5;
            document.getElementById('work-earned').textContent = workEarnings;
            document.getElementById('money').textContent = pet.money;
            workProgress = 0;
            document.getElementById('work-bar').style.width = '0%';
        }
        
        await savePetData();
    };

    workInterval = setInterval(() => {
        workProgress = Math.max(0, workProgress - 1);
        document.getElementById('work-bar').style.width = `${workProgress}%`;
    }, 200);
}

async function stopWork() {
    clearInterval(workInterval);
    document.getElementById('work-minigame').classList.add('hidden');
    await renderPet();
    showMessage(`¡Ganaste $${workEarnings}!`);
}

// Resto de funciones auxiliares (updateBar, getStateText, etc.) se mantienen igual

async function initApp() {
    tg = window.Telegram.WebApp;
    if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
    }

    const savedPet = await loadPetData();
    if (savedPet) {
        pet = Tamagotchi.fromJSON(savedPet);
        renderPet();
    } else {
        showInitForm();
    }

    // Configurar eventos
    document.getElementById('feed-btn').addEventListener('click', async () => {
        if (pet.feed()) {
            await renderPet();
            showMessage("🍔 Has alimentado a tu Tamagotchi!");
        }
    });

    document.getElementById('play-btn').addEventListener('click', async () => {
        if (pet.play()) {
            await renderPet();
            showMessage("⚽ Has jugado con tu Tamagotchi!");
        }
    });

    document.getElementById('shop-btn').addEventListener('click', () => {
        document.getElementById('shop').classList.toggle('hidden');
    });

    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', async () => {
            const cost = parseInt(item.dataset.cost);
            const itemData = {
                cost: cost,
                type: item.dataset.type,
                hunger: parseInt(item.dataset.hunger) || 0,
                happiness: parseInt(item.dataset.happiness) || 0,
                name: item.dataset.name || item.textContent.trim()
            };
            
            if (pet.buyItem(itemData)) {
                await renderPet();
                showMessage(`¡Compra realizada! ${item.textContent.trim()}`);
            } else {
                showMessage("No tienes suficiente dinero");
            }
        });
    });

    // Configurar el resto de eventos...
}

window.addEventListener('DOMContentLoaded', initApp);