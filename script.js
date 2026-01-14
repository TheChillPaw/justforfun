async function checkInventory() {
    const username = document.getElementById('username').value;
    if (!username) {
        alert('Please enter a username.');
        return;
    }

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
    }
}

function displayInventory(skins, ownedSkins) {
    const tableBody = document.querySelector('#inventoryTable tbody');
    tableBody.innerHTML = '';  // Clear previous results

    skins.forEach(skin => {
        const isOwned = ownedSkins.includes(skin.id);
        const status = isOwned ? '<span class="check">&#10004;</span>' : '<span class="cross">&#10008;</span>';

        const row = `
            <tr>
                <td>${skin.name}</td>
                <td class="status">${status}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

