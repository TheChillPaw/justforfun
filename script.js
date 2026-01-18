async function checkInventory() {
    const username = document.getElementById('username').value;
    if (!username) {
        alert('Please enter a username.');
        return;
    }

    const loadingPopup = document.getElementById('loadingPopup');
    loadingPopup.style.display = 'flex';

    const inventoryTitle = document.getElementById('inventoryTitle');
    inventoryTitle.textContent = `${username}'s inventory`;

    const inventoryUrl = 'https://gateway.venge.io/?request=get_inventory_by_name';
    const skinsUrl = 'https://gateway.venge.io/?request=get_skins_list';

    try {
        // Fetch user's inventory
        const inventoryResponse = await fetch(inventoryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${username}&session=ak1mTllrZ0UwTUFhU241ZEs4ajdpdlhzSTNGVmhqRjdYREJzTWMzUHJuWlJHaTdMMWx3MEloOGZVRXIrak50dUJkeWR4VHhUK0JrVks3NTBUU3o0RGRsaDh6K21qK0NYaUlHejlZSUhzYzR5R3ArYlAxelR0Y3MvbFFSYWpvTFI=`
        });
        const inventoryData = await inventoryResponse.json();
        const ownedSkins = inventoryData.result.map(item => item.id);

        // Fetch all skins
        const skinsResponse = await fetch(skinsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `session=ZStTL0pHNVptcEU5cjMyQmJOU0FoOHJ1bEJrdGVGOVN2QnJlVkRzTTI0YUN5QWdCT3J3QWVVdTFNa1hRVDFKdDVoSEg1STlsNVdKTlpndGdpODkyS3NZeHRFa1MwNlA3d25WM21WcC9WWjQ9`
        });
        const skinsData = await skinsResponse.json();

        // Display results
        displayInventory(skinsData.result, ownedSkins);

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        loadingPopup.style.display = 'none';
    }
}

function displayInventory(skins, ownedSkins) {
    const tableBody = document.querySelector('#inventoryTable tbody');
    tableBody.innerHTML = '';  // Clear previous results

    // Calculate statistics
    const totalSkins = skins.length;
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
    document.getElementById('totalSkins').textContent = totalSkins;
    document.getElementById('ownedSkins').textContent = ownedCount;

    // Update rarity stats
    const rarityStatsContainer = document.getElementById('rarityStats');
    rarityStatsContainer.innerHTML = '';

    Object.keys(rarityStats).sort().forEach(rarity => {
        const stats = rarityStats[rarity];
        const statItem = document.createElement('div');
        statItem.className = 'rarity-stat-item';
        statItem.innerHTML = `
            <span class="rarity-label rarity-${rarity}">${rarity.charAt(0).toUpperCase() + rarity.slice(1)}:</span>
            <span class="rarity-values">${stats.owned} / ${stats.total}</span>
        `;
        rarityStatsContainer.appendChild(statItem);
    });

    skins.forEach(skin => {
        const isOwned = ownedSkins.includes(skin.id);
        const status = isOwned ? '<span class="check">&#10004;</span>' : '<span class="cross">&#10008;</span>';
        const rowClass = isOwned ? 'owned' : 'missing';

        const row = `
            <tr class="${rowClass}">
                <td>${skin.name}</td>
                <td>${skin.type}</td>
                <td><span class="rarity-${skin.rarity.toLowerCase()}">${skin.rarity}</span></td>
                <td class="status">${status}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
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
