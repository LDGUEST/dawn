/**
 * Test script for order lookup API
 * Run with: node test-order-lookup.js
 * 
 * This will test the API endpoint directly to help debug issues
 */

const API_ENDPOINT = 'https://shopify-order-lookup.cookingwithkahnke.workers.dev';

async function testOrderLookup(orderNumber, email) {
  console.log('\n🧪 Testing Order Lookup API');
  console.log('=' .repeat(50));
  console.log(`Order Number: ${orderNumber}`);
  console.log(`Email: ${email}`);
  console.log(`API Endpoint: ${API_ENDPOINT}`);
  console.log('=' .repeat(50));

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_number: orderNumber,
        email: email,
      }),
    });

    console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    console.log('\n📋 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ SUCCESS! Order found.');
      console.log(`Order: ${data.order?.name}`);
      console.log(`Downloads: ${data.downloads?.length || 0}`);
    } else {
      console.log('\n❌ FAILED: Order not found');
      if (data.debug) {
        console.log('\n🔍 Debug Info:');
        console.log(JSON.stringify(data.debug, null, 2));
      }
    }

    return data;
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    return null;
  }
}

// Test with the known order
testOrderLookup('1779', 'speakeasywithsaki@yahoo.com')
  .then(() => {
    console.log('\n✅ Test completed. Check the output above for details.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

