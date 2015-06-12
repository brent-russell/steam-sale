$(document).ready(function()
{
	var wishlist_items = $('#wishlist_items .wishlistRow');
	
	wishlist_items.each(function(i)
	{
		var appId = this.id.match(/\d+/)[0];
		var $wishlist_item = $(this);
		
		$.get('http://store.steampowered.com/api/appdetails/?appids=' + appId + '&filters=price_overview', function(result)
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
					var $sale_data = $wishlist_row_item.find('.sale-data');
					$sale_data.add().html($sales.first());
					
					//TODO: add country code parameter setting in plugin - (example: &cc=uk to get UK pounds instead of US dollars) (also, cc parameter seems to be either proxy or server cached, simply removing the parameter does not necessarily revert the country to a default value)
					//TODO: implement language parameter setting in plugin - (example: &l=french to translate page content into french - language name must be lowercase and in English - e.g. 'french' not 'Francais'
					
					//TODO:
					// fix css when item is not on sale
					// implement daily deal countdown timer - CANCEL - display deal end date instead
					// find "Packages that include this game" section & report package sale info
					// show all purchase variants
					// add "add to cart" for each purchase option
				}, 'html');
			}
		}, 'json');
	});
});
