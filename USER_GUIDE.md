# Application Usage Guide

Follow these steps to experience the complete application flow.

> 📹 **Video Walkthrough:** Watch the Demo Video for a complete visual guide. Timestamps are noted for each step below.

[Demo Video](https://github.com/user-attachments/assets/0a30b2f0-7eb4-42ff-82b7-d3a084a0fb4f)


## Step 1: Add a Payment Card

*📹 Demo: 0:00 – 0:19*

1. Open the application at **https://localhost:3000**
2. Navigate to the **Cards** screen
3. Click **"Add Card"**
4. Enter card details (contact your Visa representative for test card credentials):
   - Card Number
   - Expiry Date
   - CVV
   - Cardholder Name
5. Click **"Continue"**
6. Your card should be added with **"PENDING"** status

## Step 2: Set Up Passkey

*📹 Demo: 0:19 – 0:52*

1. On the Cards screen, find your newly added card
2. Click **"Set Up Passkey"**
3. Select an OTP verification method
4. Click **"Continue"**
5. Enter the OTP code: **`456789`** (use this exact value)
6. Click **"Verify"**
7. Click **"Create Passkey"**
8. Follow the prompts to create a passkey using your device's authentication
9. You can manage your passkeys at https://sandbox.auth.visa.com
10. Your card status should now be **"ACTIVE"**

## Step 3: Shop with the AI Agent

*📹 Demo: 0:52 – 1:25*

1. Navigate to the **Shop** screen
2. Start a conversation with the AI shopping agent—for example: *"I'm looking for electronics"*
3. Chat with the agent as it:
   - Asks clarifying questions about your preferences
   - Searches the product catalog
   - Provides personalized recommendations
4. Browse the recommended products
5. Click **"Add to Cart"** for the products you want to purchase

## Step 4: Complete Checkout with Passkey

*📹 Demo: 1:25 – 1:58*

1. When you are ready to checkout, click **"Proceed to Checkout"**
2. Select your payment card
3. Click **"Continue with Selected Card"**
4. Click **"Verify Identity & Continue"**
5. Authenticate with your passkey
6. View your order confirmation

## Step 5: View API Logs

*📹 Demo: 1:58 – end*

1. Click the **"API Logs"** button in the top-right corner of the application
2. Click on a request to view its full request and response body
