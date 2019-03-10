/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getParticipantRegistry */

/**
 * @param {org.acme.vehicle.auction.Buy} buy - the buy transaction
 * @transaction
 */
async function transferCreditsAndMoneyCloseBid(buy) {  // eslint-disable-line no-unused-vars
    const buyerAccount = buy.buyerAccount
    const listing = buy.listing
    const sellerAccount = listing.sellerAccount
    
   	if (listing.state !== 'FOR_SALE') {
    	throw new Error('Listing is not FOR SALE')
    }
  	
  	if (buyerAccount.cashBalance >= listing.price && listing.numCredits <= sellerAccount.creditBalance) {
    	// make transaction
      	buyerAccount.cashBalance -= listing.price
       	sellerAccount.cashBalance += listing.price
      	buyerAccount.creditBalance += listing.numCredits
      	sellerAccount.creditBalance -= listing.numCredits
    
	  	listing.state = 'SOLD'
    } else if (buyerAccount.cashBalance < listing.price) {
    	throw new Error('Not enough funds')
    } else {
    	throw new Error('Not enough credits')
    }
    
  	return getAssetRegistry('org.acme.vehicle.auction.BeepBoopAccount')
  		.then(function (accountRegistry) {
    		return accountRegistry.update(buyerAccount)
    	})
  		.then(function () {
    		return getAssetRegistry('org.acme.vehicle.auction.BeepBoopAccount')
    	})
  		.then(function (accountRegistry) {
    		return accountRegistry.update(sellerAccount)
    	}).then(function () {
        	return getAssetRegistry('org.acme.vehicle.auction.CreditListing')
        }).then (function (creditRegistry) {
    		return creditRegistry.update(listing)
    	})
}