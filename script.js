// script.js

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

    tap() {
        const today = new Date().toDateString();
        if (this.lastTapDate !== today) {
            this.lastTapDate = today;
            this.tapsToday = 0;
        }
        if (this.tapsToday < 5) {
            this.tapsToday++;
            this.money += 2;
            return true;
        }
        return false;
    }

    buyItem(item) {
        if (this.money < item.cost) return false;
        this.money -= item.cost;
        if (item.type === "food") {
            this.feed(item.hunger || 20);
        } else if (item.type === "toy") {
            this.happiness = Math.min(100, this.happiness + (item.happiness || 20));
        } else if (item.type === "collectible") {
            this.inventory.push({ name: item.name || "Item", type: "collectible", date: new Date() });
        }
        return true;
    }

    toJSON() {
        return JSON.stringify(this);
    }

    static fromJSON(json) {
        const obj = typeof json === 'string' ? JSON.parse(json) : json;
        const pet = new Tamagotchi(obj.name);
        Object.assign(pet, obj);
        pet.birthDate = new Date(obj.birthDate);
        pet.lastUpdate = new Date(obj.lastUpdate);
        pet.lastEnergyRecovery = new Date(obj.lastEnergyRecovery);
        return pet;
    }
}

// App
let pet;

async function savePet() {
    localStorage.setItem("tamagotchi", pet.toJSON());
}

function updateBars() {
    const stats = ["hunger", "happiness", "energy", "cleanliness"];
    stats.forEach(stat => {
        const value = Math.round(pet[stat]);
        document.getElementById(`${stat}-bar`).style.width = `${value}%`;
        document.getElementById(`${stat}-value`).textContent = `${value}%`;
    });
    document.getElementById("money").textContent = pet.money;
    document.getElementById("pet-state").textContent = getStateText(pet.state);
    document.getElementById("pet-state").className = `state ${pet.state}`;
    document.getElementById("pet-name").textContent = pet.name;
    document.getElementById("info-age").textContent = pet.age.toFixed(1);
    document.getElementById("info-weight").textContent = pet.weight.toFixed(1);
    document.getElementById("inventory-count").textContent = pet.inventory.length;
    document.getElementById("revive-btn").classList.toggle("hidden", pet.isAlive);
    document.getElementById("sleep-btn").textContent = pet.isSleeping ? "⏰ Despertar" : "🛌 Dormir";
    document.getElementById("taps-left").textContent = Math.max(0, 5 - pet.tapsToday);
}

function getStateText(state) {
    return {
        happy: "😊 Feliz",
        hungry: "🍔 Hambriento",
        sad: "😢 Triste",
        sleepy: "😴 Durmiendo",
        dirty: "💩 Sucio",
        dead: "💀 Muerto"
    }[state] || state;
}

function init() {
    const data = localStorage.getItem("tamagotchi");
    pet = data ? Tamagotchi.fromJSON(data) : null;
    if (!pet) {
        document.getElementById("init-form").classList.remove("hidden");
        document.querySelector(".pet-container").classList.add("hidden");
        return;
    }
    pet.update();
    updateBars();
}

document.addEventListener("DOMContentLoaded", () => {
    init();

    document.getElementById("create-btn").onclick = () => {
        const name = document.getElementById("pet-name-input").value.trim() || "Tammy";
        pet = new Tamagotchi(name);
        savePet();
        document.getElementById("init-form").classList.add("hidden");
        document.querySelector(".pet-container").classList.remove("hidden");
        updateBars();
    };

    document.getElementById("feed-btn").onclick = () => { pet.feed(); savePet(); updateBars(); };
    document.getElementById("play-btn").onclick = () => { pet.play(); savePet(); updateBars(); };
    document.getElementById("sleep-btn").onclick = () => { pet.sleep(); savePet(); updateBars(); };
    document.getElementById("clean-btn").onclick = () => { pet.clean(); savePet(); updateBars(); };
    document.getElementById("revive-btn").onclick = () => { pet.revive(); savePet(); updateBars(); };

    document.getElementById("pet-container").onclick = () => {
        if (pet.tap()) {
            savePet();
            updateBars();
        }
    };

    document.querySelectorAll(".item").forEach(item => {
        item.onclick = () => {
            const itemData = {
                cost: +item.dataset.cost,
                hunger: +item.dataset.hunger,
                happiness: +item.dataset.happiness,
                energy: +item.dataset.energy,
                type: item.dataset.type,
                name: item.dataset.name
            };
            if (pet.buyItem(itemData)) {
                savePet();
                updateBars();
            }
        };
    });
});
