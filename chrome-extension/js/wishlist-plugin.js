$(document).ready(function()
{
	chrome.storage.local.get('steam-sale-helper', function(result)
	{
		var settings =
		{
			country_code: null,
			language: null,
			language_code: null,
			sale_type: null
		};

		var settings_root = result['steam-sale-helper'];
		
		if (settings_root)
		{
			settings.country_code = settings_root['country-code'],
			settings.language = settings_root['language'],
			settings.language_code = settings_root['language-code'] || 'en',	// default to english
			settings.sale_type = settings_root['sale-type'] || '*'	// default to all items
		}
		else
		{
			settings.language_code = 'en';
		}

		var appId_regex = /\d+/;
		var sale_type_regex = /(.+)!/;
		var g_ServerTime_regex = /var g_ServerTime = (\d+);/;
		var deal_countdown_regex = /InitDailyDealTimer\( \$DiscountCountdown, (\d+) \);/;
		var $wishlist_items = $('#wishlist_items .wishlistRow');
		
		// add select list filter for sale type
		$('#wishlist_sort_options')
			.before('<div class="wishlist_sale_filter">Filter Sale Type: <select id="wishlist_sale_filter"><option>*</option></select></div>')

		var $filter = $('#wishlist_sale_filter');

		$filter.change(function()
		{
			var selected_value = $(this).val();
			
			$wishlist_items.each(function()
			{
				var $wishlist_item = $(this);
				
				if (selected_value == '*')
				{
					$wishlist_item.show();
				}
				else
				{
					var $sale = $wishlist_item.find('.game_purchase_discount_countdown');
					
					if ($sale.length > 0)
					{
						var sale_type = $sale.text().match(sale_type_regex)[1];
						
						if (sale_type == selected_value)
						{
							$wishlist_item.show();
						}
						else
						{
							$wishlist_item.hide();
						}
					}
				}
			});
		});
		
		$wishlist_items.each(function(i)
		{
			var appId = this.id.match(appId_regex)[0];
			var $wishlist_item = $(this);
			
			$.get('http://store.steampowered.com/api/appdetails/?appids=' + appId + '&filters=price_overview&cc=' + settings.country_code + '&l=' + settings.language, function(result)
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

						// add sale type to select list
						var sale_type = $sale.text().match(sale_type_regex)[1];

						if ($filter.find('option[value="' + sale_type + '"]').length == 0)
						{
							$filter.append('<option value="' + sale_type + '">' + sale_type + '</option>');
						}
						
						// display daily deal end datetime
						var global_JS = $store_document.find('script:contains("g_ServerTime")').first().html();	// selector '.game_page_background.game > script' doesn't work here...
						var initCountdown_JS = $store_document.find('#game_area_purchase .game_area_purchase_game_wrapper .game_area_purchase_game > script').html();

						if (global_JS && initCountdown_JS)
						{
							var g_ServerTime = global_JS.match(g_ServerTime_regex)[1];
							var nServerEndTime = initCountdown_JS.match(deal_countdown_regex)[1];
							var nTimeRemaining = nServerEndTime - g_ServerTime;
							var endDateLocal = new Date(new Date().getTime() + nTimeRemaining * 1000);

							$sale.find('span').html(endDateLocal.toLocaleDateString(
								settings.language_code,
								{
									weekday: 'long',
									day: 'numeric',
									month: 'short',
									year: 'numeric',
									hour: 'numeric',
									minute: 'numeric'
								}
							));

							// TODO: replace text "Offer ends in" with "Offer ends" - how to handle multilingual?
							
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
		
		// select default sale filter
		$filter.val(settings.sale_type);	//TODO: need to make this line happen after all async data requests & response handlers are complete
	});
});
