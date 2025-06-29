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

                // Reset taps if new day
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

            feed(amount = 30) {
                if (!this.isAlive) return false;
                this.hunger = Math.max(0, this.hunger - amount);
                this.weight = Math.min(20, this.weight + (amount / 10));
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
                if (this.isSleeping) this.lastEnergyRecovery = new Date();
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
                    this.update();
                    return true;
                }
                return false;
            }

            buyItem(item) {
                if (this.money >= item.cost) {
                    this.money -= item.cost;

                    if (item.type === 'food') {
                        this.hunger = Math.max(0, this.hunger - (item.hunger || 20));
                    } else if (item.type === 'toy') {
                        this.happiness = Math.min(100, this.happiness + (item.happiness || 20));
                    } else if (item.type === 'collectible') {
                        this.inventory.push({
                            name: item.name || 'Item',
                            type: 'collectible',
                            date: new Date()
                        });
                    }
                    this.update();
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
                localStorage.setItem('tamagotchi', data);
                
                if (window.Telegram?.WebApp?.CloudStorage) {
                    await new Promise((resolve, reject) => {
                        Telegram.WebApp.CloudStorage.setItem('tamagotchi', data, (err) => {
                            if (err) {
                                console.error("CloudStorage error:", err);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                }
            } catch (e) {
                console.error("Save error:", e);
            }
        }

        async function loadPetData() {
            try {
                if (window.Telegram?.WebApp?.CloudStorage) {
                    const cloudData = await new Promise((resolve) => {
                        Telegram.WebApp.CloudStorage.getItem('tamagotchi', (err, value) => {
                            resolve(err ? null : value);
                        });
                    });
                    
                    if (cloudData) return JSON.parse(cloudData);
                }

                const localData = localStorage.getItem('tamagotchi');
                return localData ? JSON.parse(localData) : null;
            } catch (e) {
                console.error("Load error:", e);
                return null;
            }
        }

        function showInitForm() {
            document.getElementById('init-form').classList.remove('hidden');
            document.getElementById('pet-interface').classList.add('hidden');
        }

        function showPetInterface() {
            document.getElementById('init-form').classList.add('hidden');
            document.getElementById('pet-interface').classList.remove('hidden');
        }

        function showMessage(text) {
            const messageElement = document.getElementById('message');
            messageElement.textContent = text;
            messageElement.classList.add('show-message');
            
            setTimeout(() => {
                messageElement.classList.remove('show-message');
            }, 3000);
        }

        function updateBar(id, value) {
            const bar = document.getElementById(`${id}-bar`);
            const text = document.getElementById(`${id}-value`);

            bar.style.width = `${value}%`;
            text.textContent = `${Math.round(value)}%`;

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

        async function renderPet() {
            if (!pet) return;

            pet.update();

            // Actualizar estadísticas
            document.getElementById('money').textContent = pet.money;
            document.getElementById('hunger-value').textContent = Math.round(pet.hunger);
            document.getElementById('happiness-value').textContent = Math.round(pet.happiness);
            document.getElementById('energy-value').textContent = Math.round(pet.energy);
            document.getElementById('cleanliness-value').textContent = Math.round(pet.cleanliness);

            updateBar('hunger', pet.hunger);
            updateBar('happiness', pet.happiness);
            updateBar('energy', pet.energy);
            updateBar('cleanliness', pet.cleanliness);

            // Actualizar información
            document.getElementById('pet-name').textContent = pet.name;
            document.getElementById('pet-state').textContent = getStateText(pet.state);
            document.getElementById('info-name').textContent = pet.name;
            document.getElementById('info-age').textContent = pet.age.toFixed(1);
            document.getElementById('info-weight').textContent = pet.weight;
            document.getElementById('info-stage').textContent = getStageText(pet.stage);
            document.getElementById('inventory-count').textContent = pet.inventory.length;
            document.getElementById('taps-left').textContent = `${5 - pet.tapsToday}/5`;

            // Actualizar tiempo de recuperación
            if (pet.isSleeping) {
                const minutes = pet.calculateRecoveryTime();
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                document.getElementById('recovery-time').textContent = `${hours}h ${mins}m`;
            } else {
                document.getElementById('recovery-time').textContent = "-";
            }

            // Actualizar apariencia
            const petElement = document.getElementById('pet');
            petElement.className = 'pet';
            
            if (!pet.isAlive) {
                petElement.classList.add('dead');
                document.getElementById('revive-btn').classList.remove('hidden');
            } else {
                petElement.classList.remove('dead');
                document.getElementById('revive-btn').classList.add('hidden');
                
                if (pet.state === 'happy') {
                    petElement.classList.add('happy-animation');
                } else {
                    petElement.classList.remove('happy-animation');
                }
            }

            document.getElementById('sleep-btn').textContent = pet.isSleeping ? "⏰ Despertar" : "🛌 Dormir";

            await savePetData();
        }

        function setupEventListeners() {
            document.getElementById('create-btn').addEventListener('click', async () => {
                const nameInput = document.getElementById('pet-name-input');
                const name = nameInput.value.trim() || "Tammy";
                
                if (name.length < 2) {
                    showMessage("¡El nombre debe tener al menos 2 caracteres!");
                    return;
                }

                pet = new Tamagotchi(name);
                await savePetData();
                showPetInterface();
                renderPet();
            });

            document.getElementById('feed-btn').addEventListener('click', async () => {
                if (pet && pet.feed()) {
                    showMessage("🍔 ¡Has alimentado a tu Tamagotchi!");
                    await renderPet();
                }
            });

            document.getElementById('play-btn').addEventListener('click', async () => {
                if (pet && pet.play()) {
                    showMessage("⚽ ¡Has jugado con tu Tamagotchi!");
                    await renderPet();
                }
            });

            document.getElementById('sleep-btn').addEventListener('click', async () => {
                if (pet && pet.sleep()) {
                    const action = pet.isSleeping ? "dormido" : "despertado";
                    showMessage(`🛌 ¡Has ${action} a tu Tamagotchi!`);
                    await renderPet();
                }
            });

            document.getElementById('clean-btn').addEventListener('click', async () => {
                if (pet && pet.clean()) {
                    showMessage("🚿 ¡Has limpiado a tu Tamagotchi!");
                    await renderPet();
                }
            });

            document.getElementById('revive-btn').addEventListener('click', async () => {
                if (pet && pet.revive()) {
                    showMessage("💖 ¡Has revivido a tu Tamagotchi!");
                    await renderPet();
                }
            });

            document.getElementById('pet').addEventListener('click', async () => {
                if (!pet || !pet.isAlive) return;
                
                const petElement = document.getElementById('pet');
                petElement.classList.add('shake');

                const earned = pet.tap();
                if (earned) {
                    showMessage("+$2 por jugar con tu mascota!");
                    await renderPet();
                } else {
                    showMessage("Límite diario alcanzado (5 toques/día)");
                }

                setTimeout(() => {
                    petElement.classList.remove('shake');
                }, 500);
            });
        }

        async function initApp() {
            tg = window.Telegram?.WebApp;
            if (tg) {
                tg.expand();
                tg.enableClosingConfirmation();
            }

            setupEventListeners();

            const savedPet = await loadPetData();
            if (savedPet) {
                pet = Tamagotchi.fromJSON(savedPet);
                pet.update();
                showPetInterface();
                await renderPet();
            } else {
                showInitForm();
            }

            // Guardado automático cada 30 segundos
            setInterval(savePetData, 30000);

            // Dinero pasivo cada hora
            setInterval(async () => {
                if (pet?.collectMoney()) {
                    await renderPet();
                    showMessage("¡Has ganado $5 por tiempo jugado!");
                }
            }, 3600000);
        }

        // Iniciar la aplicación cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }