$(document).ready(function()
{
	var wishlist_items = $('#wishlist_items .wishlistRow');
	
	wishlist_items.each(function(i)
	{
		var $wishlist_item = $(this);
		var $wishlist_row_item = $wishlist_item.find('.wishlistRowItem');
		var $price_data = $wishlist_row_item.find('.gameListPriceData');
		var store_page_url = $wishlist_item.find('.gameListPriceData .storepage_btn_ctn a').attr('href'); // get the "Visit Store Page" anchor

		$price_data.children().first().before('<div class="sale-data"></div>');
		
		$.get(store_page_url, function(store_page_html)
		{
			// find first buy section & report sale type info
			var $store_document = $($.parseHTML(store_page_html, null, true));
			var $sales = $store_document.find('#game_area_purchase .game_area_purchase_game_wrapper .game_area_purchase_game .game_purchase_discount_countdown');
			var $sale_data = $wishlist_row_item.find('.sale-data');
			$sale_data.add().html($sales.first());
			
			//TODO:
			// implement daily deal countdown timer
			// find "Packages that include this game" section & report package sale info
			// show all purchase variants
			// add "add to cart" for each purchase option
		}, 'html');
	});
});
