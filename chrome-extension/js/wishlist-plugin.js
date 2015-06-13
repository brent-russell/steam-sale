$(document).ready(function()
{
	chrome.storage.local.get('steam-sale-helper', function(result)
	{
		var country_code = result['steam-sale-helper']['country-code'];
		var language = result['steam-sale-helper']['language'];
		var wishlist_items = $('#wishlist_items .wishlistRow');
		
		wishlist_items.each(function(i)
		{
			var appId = this.id.match(/\d+/)[0];
			var $wishlist_item = $(this);
			
			$.get('http://store.steampowered.com/api/appdetails/?appids=' + appId + '&filters=price_overview&cc=' + country_code + '&l=' + language, function(result)
			{
				var $data = result[Object.keys(result)[0]].data;

				if($data.price_overview.discount_percent > 0)
				{
					var $wishlist_row_item = $wishlist_item.find('.wishlistRowItem');
					var store_page_url = $wishlist_item.find('.gameListPriceData .storepage_btn_ctn a').attr('href'); // get the "Visit Store Page" anchor
					var $price_data = $wishlist_row_item.find('.gameListPriceData');

					$price_data.children().first().before('<div class="sale-data"></div>');

					// the only way to get the sale type is to scrape the store page html
					$.get(store_page_url, function(store_page_html)
					{
						// find first buy section & report sale type info
						var $store_document = $($.parseHTML(store_page_html, null, true));
						var $sales = $store_document.find('#game_area_purchase .game_area_purchase_game_wrapper .game_area_purchase_game .game_purchase_discount_countdown');
						var $sale = $sales.first();
						var $sale_data = $wishlist_row_item.find('.sale-data');
						$sale_data.add().html($sale);

						// display daily deal end datetime
						var global_JS = $store_document.find('script:contains("g_ServerTime")').first().html();	// selector '.game_page_background.game > script' doesn't work here...
						var initCountdown_JS = $store_document.find('#game_area_purchase .game_area_purchase_game_wrapper .game_area_purchase_game > script').html();

						if (global_JS && initCountdown_JS)
						{
							var g_ServerTime = global_JS.match(/var g_ServerTime = (\d+);/)[1];
							var nServerEndTime = initCountdown_JS.match(/InitDailyDealTimer\( \$DiscountCountdown, (\d+) \);/)[1];
							var nTimeRemaining = nServerEndTime - g_ServerTime;
							var endDateLocal = new Date(new Date().getTime() + nTimeRemaining * 1000);

							$sale.find('span').html(endDateLocal.toLocaleDateString("en", {	// TODO: replace en with language code
								weekday: 'long',
								day: 'numeric',
								month: 'short',
								year: 'numeric',
								hour: 'numeric',
								minute: 'numeric'
							}));

							// TODO: replace text "Offer ends in" with "Offer ends" or "Offer ends on"
							
							//var nEndTimeLocal = Math.round( new Date().getTime() / 1000 ) + nTimeRemaining;
							//new Countdown( elTimer, nEndTimeLocal );
						}
						
						//TODO:
						// fix css when item is not on sale
						// find "Packages that include this game" section & report package sale info
						// show all purchase variants
						// add "add to cart" for each purchase option
					}, 'html');
				}
			}, 'json');
		});
	});
});
