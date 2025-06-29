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
        const hours = (now - this.lastUpdate) / 3600000;

        if (now.toDateString() !== this.lastTapDate) {
            this.tapsToday = 0;
            this.lastTapDate = now.toDateString();
        }

        if (this.isAlive) {
            if (this.isSleeping) {
                this.energy = Math.min(100, this.energy + hours * 10);
                this.hunger = Math.min(100, this.hunger + hours * 2);
            } else {
                this.hunger = Math.min(100, this.hunger + hours * 5);
                this.happiness = Math.max(0, this.happiness - hours * 3);
                this.cleanliness = Math.max(0, this.cleanliness - hours * 2);
                this.energy = Math.max(0, this.energy - hours * 4);
            }

            this.age = (now - this.birthDate) / (1000 * 60 * 60 * 24);
            if (this.stage === "egg" && this.age >= 3) this.stage = "baby";
            else if (this.stage === "baby" && this.age >= 7) this.stage = "adult";

            if (this.hunger >= 100 || this.happiness <= 0 || this.energy <= 0) {
                this.isAlive = false;
                this.state = "dead";
            } else {
                if (this.isSleeping) this.state = "sleepy";
                else if (this.hunger > 70) this.state = "hungry";
                else if (this.happiness < 30) this.state = "sad";
                else if (this.cleanliness < 20) this.state = "dirty";
                else this.state = "happy";
            }
        }

        this.lastUpdate = now;
    }

    feed(amount = 30) {
        if (!this.isAlive) return false;
        this.hunger = Math.max(0, this.hunger - amount);
        this.weight = Math.min(20, this.weight + amount / 10);
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
        this.hunger = this.happiness = this.energy = this.cleanliness = 50;
        this.state = "happy";
        this.isSleeping = false;
        return true;
    }

    collectMoney() {
        const now = new Date();
        const hours = (now - this.lastEnergyRecovery) / 3600000;
        if (hours >= 1) {
            this.money += Math.floor(hours) * 5;
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
        if (this.money < item.cost) return false;
        this.money -= item.cost;

        if (item.type === "food") this.feed(item.hunger || 20);
        else if (item.type === "toy") this.happiness = Math.min(100, this.happiness + (item.happiness || 20));
        else if (item.type === "collectible") {
            this.inventory.push({ name: item.name || "Item", type: "collectible", date: new Date() });
        }
        return true;
    }

    calculateRecoveryTime() {
        if (!this.isSleeping) return 0;
        return Math.ceil((100 - this.energy) / 2);
    }

    work() {
        this.money += 2;
        return 2;
    }

    toJSON() {
        return {
            name: this.name,
            birthDate: +this.birthDate,
            lastUpdate: +this.lastUpdate,
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
            lastEnergyRecovery: +this.lastEnergyRecovery,
            tapsToday: this.tapsToday,
            lastTapDate: this.lastTapDate,
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
        pet.money = json.money;
        pet.inventory = json.inventory;
        pet.lastEnergyRecovery = new Date(json.lastEnergyRecovery);
        pet.tapsToday = json.tapsToday;
        pet.lastTapDate = json.lastTapDate;
        return pet;
    }
}

// Variables globales
let pet = null, tg = null, workInterval = null, workEarnings = 0, workProgress = 0;

// Guardado / carga
async function savePetData() {
    if (!pet) return;
    const data = JSON.stringify(pet);
    localStorage.setItem("tamagotchi", data);
    if (window.Telegram?.WebApp?.CloudStorage) {
        try {
            await Telegram.WebApp.CloudStorage.setItem("tamagotchi", data);
        } catch (e) {
            console.error("CloudStorage error:", e);
        }
    }
}

async function loadPetData() {
    let json = localStorage.getItem("tamagotchi");
    if (window.Telegram?.WebApp?.CloudStorage) {
        try {
            json = await new Promise(resolve => Telegram.WebApp.CloudStorage.getItem("tamagotchi", (_, v) => resolve(v || json)));
        } catch (e) {
            console.error("CloudStorage load error:", e);
        }
    }
    return json ? JSON.parse(json) : null;
}

// Inyección de UI
function updateBar(id, value) {
    const bar = document.getElementById(`${id}-bar`);
    const text = document.getElementById(`${id}-value`);
    bar.style.width = `${value}%`;
    bar.textContent = `${Math.round(value)}%`;
    bar.style.backgroundColor = value > 70 ? "#4caf50" : (value < 30 ? "#f44336" : "#ff9800");
}

function getStateText(s) {
    return { happy: "😊 Feliz", hungry: "🍔 Hambriento", sad: "😢 Triste", sleepy: "😴 Durmiendo", dirty: "💩 Sucio", dead: "💀 Muerto" }[s] || s;
}

function getStageText(s) {
    return { egg: "Huevo", baby: "Bebé", adult: "Adulto" }[s] || s;
}

function showMessage(text) {
    (window.Telegram?.WebApp?.showAlert && Telegram.WebApp.showAlert(text)) || alert(text);
}

// Renderea estado UI
async function renderPet() {
    if (!pet) return;
    pet.update();
    await savePetData();

    document.getElementById("money").textContent = pet.money;
    updateBar("hunger", pet.hunger);
    updateBar("happiness", pet.happiness);
    updateBar("energy", pet.energy);
    updateBar("cleanliness", pet.cleanliness);

    document.getElementById("pet-name").textContent = pet.name;
    document.getElementById("pet-state").textContent = getStateText(pet.state);
    document.getElementById("pet-state").className = `state ${pet.state}`;
    document.getElementById("info-age").textContent = pet.age.toFixed(1);
    document.getElementById("info-weight").textContent = pet.weight;
    document.getElementById("info-state").textContent = getStageText(pet.stage);
    document.getElementById("inventory-count").textContent = pet.inventory.length;

    document.getElementById("recovery-time").textContent = pet.isSleeping
        ? `${Math.floor(pet.calculateRecoveryTime()/60)}h ${pet.calculateRecoveryTime()%60}m`
        : "No está durmiendo";
    document.getElementById("taps-left").textContent = Math.max(0, 5 - pet.tapsToday);

    const el = document.getElementById("pet");
    el.className = `pet ${pet.isAlive ? pet.stage : "dead-pet"}`;
    if (pet.isAlive && !pet.isSleeping) {
        el.classList.add(pet.state === "happy" ? "happy-animation" : pet.state === "sad" ? "sad-animation" : "");
    }
    document.getElementById("sleep-btn").textContent = pet.isSleeping ? "⏰ Despertar" : "🛌 Dormir";
    document.getElementById("revive-btn").classList.toggle("hidden", pet.isAlive);
}

// Minijuego de trabajo
function startWork() {
    document.getElementById("work-minigame").classList.remove("hidden");
    workEarnings = 0;
    workProgress = 0;
    document.getElementById("work-earned").textContent = "0";
    document.getElementById("work-bar").style.width = "0%";

    const area = document.getElementById("work-click-area");
    area.onclick = async () => {
        pet.money += 2;
        workEarnings += 2;
        document.getElementById("work-earned").textContent = workEarnings;
        workProgress = Math.min(100, workProgress + 15);
        document.getElementById("work-bar").style.width = `${workProgress}%`;

        if (workProgress >= 100) {
            pet.money += 5;
            workEarnings += 5;
            document.getElementById("work-earned").textContent = workEarnings;
            workProgress = 0;
            document.getElementById("work-bar").style.width = "0%";
        }

        await savePetData();
        document.getElementById("money").textContent = pet.money;
    };

    workInterval = setInterval(() => {
        workProgress = Math.max(0, workProgress - 1);
        document.getElementById("work-bar").style.width = `${workProgress}%`;
    }, 200);
}

async function stopWork() {
    clearInterval(workInterval);
    document.getElementById("work-minigame").classList.add("hidden");
    await renderPet();
    showMessage(`¡Ganaste $${workEarnings}!`);
}

// Inicialización
async function initApp() {
    tg = window.Telegram?.WebApp;
    if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
    }

    const saved = await loadPetData();
    pet = saved ? Tamagotchi.fromJSON(saved) : null;

    if (pet) {
        await renderPet();
    } else {
        document.getElementById("init-form").classList.remove("hidden");
        document.querySelector(".pet-container").classList.add("hidden");
    }

    // Listeners
    document.getElementById("create-btn").addEventListener("click", async () => {
        const name = document.getElementById("pet-name-input").value.trim() || "Tammy";
        pet = new Tamagotchi(name);
        await savePetData();
        document.getElementById("init-form").classList.add("hidden");
        document.querySelector(".pet-container").classList.remove("hidden");
        await renderPet();
    });

    document.getElementById("feed-btn").addEventListener("click", async () => {
        if (pet?.feed()) {
            await renderPet();
            showMessage("🍔 Has alimentado a tu Tamagotchi!");
        }
    });

    document.getElementById("play-btn").addEventListener("click", async () => {
        if (pet?.play()) {
            await renderPet();
            showMessage("⚽ Has jugado con tu Tamagotchi!");
        }
    });

    document.getElementById("sleep-btn").addEventListener("click", async () => {
        if (pet?.sleep()) {
            await renderPet();
            showMessage(pet.isSleeping ? "🛌 Ahora está durmiendo" : "⏰ Se despertó");
        }
    });

    document.getElementById("clean-btn").addEventListener("click", async () => {
        if (pet?.clean()) {
            await renderPet();
            showMessage("🚿 Limpieza completa!");
        }
    });

    document.getElementById("revive-btn").addEventListener("click", async () => {
        if (pet?.revive()) {
            await renderPet();
            showMessage("💖 Revivido!");
        }
    });

    document.getElementById("shop-btn").addEventListener("click", () => {
        document.getElementById("shop").classList.toggle("hidden");
    });

    document.getElementById("work-btn").addEventListener("click", startWork);
    document.getElementById("work-stop").addEventListener("click", stopWork);

    document.getElementById("pet-container").addEventListener("click", async () => {
        if (pet?.tap()) {
            await renderPet();
            showMessage("+$2 por jugar con tu mascota!");
        } else {
            showMessage("Límite diario alcanzado (5 toques/día)");
        }
    });

    document.querySelectorAll(".item").forEach(item => {
        item.addEventListener("click", async () => {
            const itemData = {
                cost: +item.dataset.cost,
                type: item.dataset.type,
                hunger: +item.dataset.hunger,
                happiness: +item.dataset.happiness,
                name: item.dataset.name,
            };
            if (pet?.buyItem(itemData)) {
                await renderPet();
                showMessage(`¡Compraste "${item.textContent.trim()}"!`);
            } else {
                showMessage("No tienes suficiente dinero");
            }
        });
    });

    setInterval(async () => {
        if (pet?.collectMoney()) {
            await renderPet();
            showMessage("¡Ganaste $5 por tiempo!");
        }
    }, 60000);
}

window.addEventListener("DOMContentLoaded", initApp);
