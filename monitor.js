// Import required modules
const fetch = globalThis.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));
const TelegramBot = require('node-telegram-bot-api');

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Your bot token
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // Your chat ID
const BSC_WALLET_ADDRESSES = process.env.BSC_WALLET_ADDRESSES.split(',').map(addr => addr.toLowerCase()); // Lowercase addresses
const CHECK_INTERVAL = process.env.CHECK_INTERVAL || 60000; // Check every 1 minute
const BLOCK_BUFFER = process.env.BLOCK_BUFFER || 10; // Buffer of 10 blocks
const BLOCK_TIME = 3000; // Average time for 1 block in milliseconds (3 seconds)
const BUFFER_BLOCKS = process.env.BUFFER_BLOCKS || 15; // Additional buffer blocks
const BSC_RPC_URL = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'; // BSC node URL

// Telegram bot setup
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Helper function to add a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Store processed transaction hashes
const processedTransactions = new Set();

// Helper function to make raw JSON-RPC calls
async function makeRpcCall(method, params) {
    try {
        const response = await fetch(BSC_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id: 1
            })
        });
        const { result, error } = await response.json();
        if (error) {
            throw new Error(error.message);
        }
        return result;
    } catch (err) {
        console.error(`RPC Error (${method}):`, err);
        throw err;
    }
}

// Function to fetch logs and transactions
async function checkTransfers() {
    try {
        console.log('Starting to check transfers for multiple addresses...');

        // Get the current block number
        const currentBlock = parseInt(await makeRpcCall('eth_blockNumber', []), 16);

        // Calculate the block range
        const blocksInInterval = Math.ceil(CHECK_INTERVAL / BLOCK_TIME); // Blocks in the interval
        const totalBlocksToCheck = blocksInInterval + BUFFER_BLOCKS; // Add buffer blocks
        const fromBlock = currentBlock - totalBlocksToCheck + 1; // Define the range

        console.log(`Current block: ${currentBlock}, checking from block: ${fromBlock} to ${currentBlock}`);

        for (let blockNumber = fromBlock; blockNumber <= currentBlock; blockNumber++) {
            console.log(`Checking block ${blockNumber}...`);

            // Fetch block details
            const block = await makeRpcCall('eth_getBlockByNumber', [`0x${blockNumber.toString(16)}`, true]);

            if (block && block.transactions.length > 0) {
                for (const tx of block.transactions) {
                    const isFromMonitored = BSC_WALLET_ADDRESSES.includes(tx.from?.toLowerCase());
                    const isToMonitored = BSC_WALLET_ADDRESSES.includes(tx.to?.toLowerCase());

                    if (isFromMonitored || isToMonitored) {
                        if (processedTransactions.has(tx.hash)) {
                            continue; // Skip already processed transactions
                        }

                        // Add transaction hash to the processed set
                        processedTransactions.add(tx.hash);

                        // Parse transaction details
                        const amount = parseFloat(parseInt(tx.value, 16) / 1e18).toFixed(6); // Convert wei to BNB
                        const txUrl = `https://bscscan.com/tx/${tx.hash}`;

                        // Log transaction details
                        const message = `New transaction detected:\nFrom: ${tx.from}\nTo: ${tx.to}\nAmount: ${amount} BNB\nTransaction URL: ${txUrl}`;
                        console.log(message);

                        // Send a Telegram message
                        await sendTelegramMessage(message);
                        await sleep(1000); // Avoid rate limits
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking transfers:', error);
    } finally {
        console.log(`Waiting for ${CHECK_INTERVAL} milliseconds before the next check...`);
        setTimeout(checkTransfers, CHECK_INTERVAL); // Schedule the next check
    }
}

// Function to send Telegram messages
async function sendTelegramMessage(message) {
    try {
        console.log('Sending message to Telegram:', message);
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            })
        });

        const result = await response.json();
        if (!result.ok) {
            throw new Error(result.description);
        }
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
    }
}

// Start the script
console.log('Starting initial transfer check...');
checkTransfers();

