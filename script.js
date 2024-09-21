async function fetchInventory() {
    const username = document.getElementById('username').value;
    if (!username) {
        alert('Please enter a username');
        return;
    }

    try {
        const inventoryResponse = await fetch("https://gateway.venge.io/?request=get_inventory_by_name", {
            "headers": {
              "accept": "*/*",
              "accept-language": "en-US,en;q=0.9",
              "content-type": "application/x-www-form-urlencoded",
              "priority": "u=1, i",
              "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site"
            },
            "referrer": "https://social.venge.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": `username=${username}&session=ZStTL0pHNVptcEU5cjMyQmJOU0FoOHJ1bEJrdGVGOVN2QnJlVkRzTTI0YUN5QWdCT3J3QWVVdTFNa1hRVDFKdDVoSEg1STlsNVdKTlpndGdpODkyS3NZeHRFa1MwNlA3d25WM21WcC9WWjQ9`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
          });
          

        const inventoryData = await inventoryResponse.json();
        if (!inventoryData.success) {
            throw new Error('Failed to fetch inventory');
        }

        const skinsResponse = await fetch("https://gateway.venge.io/?request=get_skins_list", {
            "headers": {
              "accept": "*/*",
              "accept-language": "en-US,en;q=0.9",
              "content-type": "application/x-www-form-urlencoded",
              "priority": "u=1, i",
              "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site"
            },
            "referrer": "https://social.venge.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "session=ZStTL0pHNVptcEU5cjMyQmJOU0FoOHJ1bEJrdGVGOVN2QnJlVkRzTTI0YUN5QWdCT3J3QWVVdTFNa1hRVDFKdDVoSEg1STlsNVdKTlpndGdpODkyS3NZeHRFa1MwNlA3d25WM21WcC9WWjQ9",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
          });
          

        const skinsData = await skinsResponse.json();
        if (!skinsData.success) {
            throw new Error('Failed to fetch skins list');
        }

        updateSkinsTable(inventoryData.result, skinsData.result);
    } catch (error) {
        console.error(error);
        alert('Error fetching data');
    }
}

function updateSkinsTable(inventory, skins) {
    const tableBody = document.querySelector('#skins-table tbody');
    tableBody.innerHTML = '';

    const inventoryIds = inventory.map(item => item.id);

    skins.forEach(skin => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = skin.name;
        row.appendChild(nameCell);

        const ownedCell = document.createElement('td');
        if (inventoryIds.includes(skin.id)) {
            ownedCell.textContent = '✔';
        } else {
            ownedCell.textContent = '✖';
        }
        row.appendChild(ownedCell);

        tableBody.appendChild(row);
    });
}