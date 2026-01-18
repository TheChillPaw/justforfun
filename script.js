let allSkins = [];
let allOwnedSkins = [];
let currentFilter = 'all';

function showLoadingPopup(message = 'Loading inventory...', isError = false) {
    const loadingPopup = document.getElementById('loadingPopup');
    const loadingContent = loadingPopup.querySelector('.loading-content');
    const loadingMessage = document.getElementById('loadingMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const loadingCloseButton = document.getElementById('loadingCloseButton');

    loadingMessage.textContent = message;

    if (isError) {
        loadingContent.classList.add('error');
        loadingSpinner.style.display = 'none';
        loadingCloseButton.style.display = 'inline-block';
        loadingPopup.dataset.closable = 'true';
    } else {
        loadingContent.classList.remove('error');
        loadingSpinner.style.display = 'block';
        loadingCloseButton.style.display = 'none';
        loadingPopup.dataset.closable = 'false';
    }

    loadingPopup.style.display = 'flex';
    loadingPopup.setAttribute('aria-hidden', 'false');
}

function hideLoadingPopup() {
    const loadingPopup = document.getElementById('loadingPopup');
    loadingPopup.style.display = 'none';
    loadingPopup.setAttribute('aria-hidden', 'true');
}

function clearInventory() {
    const tableBody = document.querySelector('#inventoryTable tbody');
    tableBody.innerHTML = '';

    document.getElementById('totalSkins').textContent = '0';
    document.getElementById('ownedSkins').textContent = '0';

    const rarityStatsContainer = document.getElementById('rarityStats');
    rarityStatsContainer.innerHTML = '';

    allSkins = [];
    allOwnedSkins = [];
    currentFilter = 'all';
}

async function checkInventory() {
    clearInventory();

    const rawUsername = document.getElementById('username').value;
    const username = rawUsername.trim();

    const inventoryTitle = document.getElementById('inventoryTitle');
    inventoryTitle.textContent = username ? `${username}'s inventory` : 'Inventory';

    if (!username) {
        showLoadingPopup('Please enter a username.', true);
        return;
    }

    showLoadingPopup('Loading inventory...');

    const inventoryUrl = 'https://gateway.venge.io/?request=get_inventory_by_name';
    const skinsUrl = 'https://gateway.venge.io/?request=get_skins_list';
    const profileUrl = `https://gateway.venge.io/?request=get_profile_details_v2&username=${encodeURIComponent(username)}`;

    try {
        const inventoryResponse = await fetch(inventoryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${encodeURIComponent(username)}&session=ak1mTllrZ0UwTUFhU241ZEs4ajdpdlhzSTNGVmhqRjdYREJzTWMzUHJuWlJHaTdMMWx3MEloOGZVRXIrak50dUJkeWR4VHhUK0JrVks3NTBUU3o0RGRsaDh6K21qK0NYaUlHejlZSUhzYzR5R3ArYlAxelR0Y3MvbFFSYWpvTFI=`
        });

        if (!inventoryResponse.ok) {
            showLoadingPopup('Failed to load inventory. Please try again.', true);
            return;
        }

        const inventoryData = await inventoryResponse.json();

        if (inventoryData.success === false) {
            if (inventoryData.message === 'Receiver username is not found!') {
                showLoadingPopup(`Username "${username}" not found. Please check the spelling and try again.`, true);
            } else if (inventoryData.message === 'Receiver has no items!') {
                showLoadingPopup(`User "${username}" has no items in their inventory.`, true);
            } else {
                showLoadingPopup(`Error: ${inventoryData.message}`, true);
            }
            return;
        }

        const ownedSkins = Array.isArray(inventoryData.result) ? inventoryData.result.map(item => item.id) : [];

        const skinsResponse = await fetch(skinsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `session=ZStTL0pHNVptcEU5cjMyQmJOU0FoOHJ1bEJrdGVGOVN2QnJlVkRzTTI0YUN5QWdCT3J3QWVVdTFNa1hRVDFKdDVoSEg1STlsNVdKTlpndGdpODkyS3NZeHRFa1MwNlA3d25WM21WcC9WWjQ9`
        });

        if (!skinsResponse.ok) {
            showLoadingPopup('Failed to load skins list. Please try again.', true);
            return;
        }

        const skinsData = await skinsResponse.json();
        
        if (!skinsData || skinsData.success === false || !Array.isArray(skinsData.result)) {
            showLoadingPopup('Failed to load skins list. Please try again.', true);
            return;
        }

        const profileResponse = await fetch(profileUrl);
        let isVerified = false;

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.success && profileData.verified === "1") {
                isVerified = true;
            }
        }

        allSkins = [...skinsData.result];
        
        const verificationCharmId = 'verification_charm';
        const verificationCharm = {
            id: verificationCharmId,
            name: 'Verification Charm',
            type: 'Charm',
            rarity: 'None'
        };
        
        // Check if Verification Charm exists in the skins list (by ID or name)
        const existingVerificationCharm = allSkins.find(skin => 
            skin.id === verificationCharmId || 
            (skin.name && skin.name.toLowerCase() === 'verification charm')
        );
        
        // If it doesn't exist, add it manually
        if (!existingVerificationCharm) {
            allSkins.push(verificationCharm);
        }
        
        // Determine the actual ID to use for ownership (prefer the one from API if it exists)
        const actualVerificationCharmId = existingVerificationCharm ? existingVerificationCharm.id : verificationCharmId;
        
        allOwnedSkins = [...ownedSkins];
        if (isVerified && !allOwnedSkins.includes(actualVerificationCharmId)) {
            allOwnedSkins.push(actualVerificationCharmId);
        }
        
        currentFilter = 'all';

        displayInventory(allSkins, allOwnedSkins);
        hideLoadingPopup();

    } catch (error) {
        console.error('Error fetching data:', error);
        showLoadingPopup('An error occurred while fetching inventory data. Please try again.', true);
    }
}

function displayInventory(skins, ownedSkins) {
    const tableBody = document.querySelector('#inventoryTable tbody');
    tableBody.innerHTML = '';  // Clear previous results

    // Calculate statistics
    const totalSkinsCount = skins.length;
    const ownedCount = ownedSkins.length;

    // Calculate stats by rarity
    const rarityStats = {};
    skins.forEach(skin => {
        const rarity = skin.rarity.toLowerCase();
        if (!rarityStats[rarity]) {
            rarityStats[rarity] = { total: 0, owned: 0 };
        }
        rarityStats[rarity].total++;
        if (ownedSkins.includes(skin.id)) {
            rarityStats[rarity].owned++;
        }
    });

    // Update total stats
    document.getElementById('totalSkins').textContent = totalSkinsCount;
    document.getElementById('ownedSkins').textContent = ownedCount;

    // Update rarity stats
    const rarityStatsContainer = document.getElementById('rarityStats');
    rarityStatsContainer.innerHTML = '';

    // Add "All" filter option
    const allStatItem = document.createElement('div');
    allStatItem.className = `rarity-stat-item ${currentFilter === 'all' ? 'active' : ''}`;
    allStatItem.innerHTML = `
        <span class="rarity-label rarity-all">All:</span>
        <span class="rarity-values">${ownedCount} / ${totalSkinsCount}</span>
    `;
    allStatItem.onclick = () => {
        currentFilter = 'all';
        displayInventory(allSkins, allOwnedSkins);
    };
    rarityStatsContainer.appendChild(allStatItem);

    Object.keys(rarityStats).sort().forEach(rarity => {
        const stats = rarityStats[rarity];
        const statItem = document.createElement('div');
        statItem.className = `rarity-stat-item ${currentFilter === rarity ? 'active' : ''}`;
        statItem.innerHTML = `
            <span class="rarity-label rarity-${rarity}">${rarity.charAt(0).toUpperCase() + rarity.slice(1)}:</span>
            <span class="rarity-values">${stats.owned} / ${stats.total}</span>
        `;
        statItem.onclick = () => {
            currentFilter = currentFilter === rarity ? 'all' : rarity;
            displayInventory(allSkins, allOwnedSkins);
        };
        rarityStatsContainer.appendChild(statItem);
    });

    let tableHTML = '';
    skins.forEach(skin => {
        const rarity = skin.rarity.toLowerCase();
        if (currentFilter !== 'all' && rarity !== currentFilter) {
            return;
        }

        const isOwned = ownedSkins.includes(skin.id);
        const status = isOwned ? '<span class="check">&#10004;</span>' : '<span class="cross">&#10008;</span>';
        const rowClass = isOwned ? 'owned' : 'missing';

        tableHTML += `
            <tr class="${rowClass}">
                <td>${skin.name}</td>
                <td>${skin.type}</td>
                <td><span class="rarity-${rarity}">${skin.rarity}</span></td>
                <td class="status">${status}</td>
            </tr>
        `;
    });
    tableBody.innerHTML = tableHTML;
}

// Theme Toggle Logic
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// Check for saved theme preference or browser preference
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    setTheme(savedTheme);
} else if (prefersDark) {
    setTheme('dark');
} else {
    setTheme('light');
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Close button for loading popup
document.getElementById('loadingCloseButton').addEventListener('click', hideLoadingPopup);
