import { backend } from 'declarations/backend';
import { AuthClient } from '@dfinity/auth-client';

let authClient;
let principal;

async function init() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        principal = await authClient.getIdentity().getPrincipal();
        handleAuthenticated();
    } else {
        await login();
    }
}

async function login() {
    await authClient.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: async () => {
            principal = await authClient.getIdentity().getPrincipal();
            handleAuthenticated();
        },
    });
}

function handleAuthenticated() {
    document.getElementById('createAuctionBtn').addEventListener('click', showCreateAuctionModal);
    document.getElementById('viewAuctionsBtn').addEventListener('click', displayAuctions);
    document.getElementById('createAuctionForm').addEventListener('submit', handleCreateAuction);
    displayAuctions();
}

function showCreateAuctionModal() {
    document.getElementById('createAuctionModal').style.display = 'block';
}

async function handleCreateAuction(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const startPrice = parseInt(document.getElementById('startPrice').value);
    const duration = parseInt(document.getElementById('duration').value);

    try {
        const auctionId = await backend.createAuction(title, description, startPrice, duration);
        alert(`Auction created with ID: ${auctionId}`);
        document.getElementById('createAuctionModal').style.display = 'none';
        displayAuctions();
    } catch (error) {
        console.error('Error creating auction:', error);
        alert('Failed to create auction. Please try again.');
    }
}

async function displayAuctions() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<h2>Active Auctions</h2>';

    try {
        const auctions = await backend.getActiveAuctions();
        if (auctions.length === 0) {
            mainContent.innerHTML += '<p>No active auctions found.</p>';
        } else {
            const auctionList = document.createElement('ul');
            auctions.forEach(auction => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <h3>${auction.title}</h3>
                    <p>${auction.description}</p>
                    <p>Start Price: ${auction.startPrice}</p>
                    <p>Highest Bid: ${auction.highestBid ? auction.highestBid.amount : 'No bids yet'}</p>
                    <p>Ends at: ${new Date(Number(auction.endTime) / 1000000).toLocaleString()}</p>
                    <button onclick="placeBid(${auction.id})">Place Bid</button>
                `;
                auctionList.appendChild(listItem);
            });
            mainContent.appendChild(auctionList);
        }
    } catch (error) {
        console.error('Error fetching auctions:', error);
        mainContent.innerHTML += '<p>Failed to load auctions. Please try again later.</p>';
    }
}

async function placeBid(auctionId) {
    const bidAmount = prompt('Enter your bid amount:');
    if (bidAmount === null || bidAmount === '') return;

    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid bid amount.');
        return;
    }

    try {
        const result = await backend.placeBid(auctionId, amount);
        if (result) {
            alert('Bid placed successfully!');
            displayAuctions();
        } else {
            alert('Failed to place bid. Please try again.');
        }
    } catch (error) {
        console.error('Error placing bid:', error);
        alert('Failed to place bid. Please try again.');
    }
}

window.placeBid = placeBid;
init();
