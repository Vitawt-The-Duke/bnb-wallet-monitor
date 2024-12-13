# BNB Wallet Monitor

This project is a custom alerter for receiving information about BNB transfers for specific wallet accounts. It uses Telegram to send notifications about detected transactions.

## Prerequisites

1. **Telegram Bot:**
   - You need a Telegram bot to receive notifications.
   - Obtain your personal chat ID to connect the bot.

2. **Node.js:**
   - Requires Node.js version 18 or higher.

3. **Dependencies:**
   - Ensure the necessary dependencies (`node-telegram-bot-api` and `web3`) are installed. Use `npm install` to set up the project.

## Setup Instructions

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/Vitawt-The-Duke/bnb-wallet-monitor.git
   cd bnb-wallet-monitor
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Create a Telegram Bot and Get a Bot Token:**
   Follow the instructions in [Create a Telegram Bot and get a Bot Token](#create-a-telegram-bot-and-get-a-bot-token).

4. **Set Environment Variables:**
   - Create a `.env` file or set the following variables:
     ```
     TELEGRAM_BOT_TOKEN=your-telegram-bot-token
     TELEGRAM_CHAT_ID=your-chat-id
     BSC_WALLET_ADDRESSES=comma-separated-list-of-wallet-addresses
     BSC_RPC_URL=https://bsc-dataseed.binance.org/  # Or another RPC provider
     ```

5. **Run the Script:**
   ```bash
   node monitor.js
   ```

## Docker-compose
   ```bash
   docker-compose up -d
   ```


## How to Get Telegram Bot Chat ID

### Create a Telegram Bot and Get a Bot Token

1. Open Telegram and search for `@BotFather`.
2. Start a chat with `@BotFather`.
3. Create a new bot by typing `/newbot` and follow the instructions.
4. Copy the generated bot token. For example:
   ```
   123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   ```

### Get Chat ID for a Private Chat

1. Start a chat with your bot and send a message.
2. Open the following URL in your browser:
   ```
   https://api.telegram.org/bot<your-bot-token>/getUpdates
   ```
3. Find the `chat.id` in the response JSON. This is your chat ID.

### Get Chat ID for a Channel

1. Add your bot to a channel and send a message in the channel.
2. Open the same URL as above (`getUpdates`).
3. Find the `chat.id` under `channel_post`. This is your channel's chat ID.

### Get Chat ID for a Group Chat

1. Add your bot to a group and send a message.
2. Use `getUpdates` or right-click on a message and copy its link.
3. Extract the group chat ID and prefix it with `-100` if needed.

### Get Chat ID for a Topic in a Group Chat

1. Use `getUpdates` or copy the message link.
2. Extract the `message_thread_id` from the link.

## How It Works

1. The bot monitors BNB wallet transactions using the Binance Smart Chain (BSC) network.
2. Transactions are detected in real-time based on:
   - A polling interval of 1 minute.
   - A buffer of 10 blocks to prevent missed transactions.
3. Notifications include transaction details:
   - Sender Address
   - Receiver Address
   - Amount in BNB
   - Transaction URL

## Example Notification
```plaintext
New transaction detected:
From: 0xSenderAddress
To: 0xReceiverAddress
Amount: 0.123456 BNB
Transaction URL: https://bscscan.com/tx/0xTransactionHash
```

## License
This project is licensed under the MIT License.
