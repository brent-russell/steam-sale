$(document).ready(function(){
	// populate input form with values from local storage
	chrome.storage.local.get('steam-sale-helper', function(result) {
		$('#country-code').val(result['steam-sale-helper']['country-code']);
		$('#language').val(result['steam-sale-helper']['language']);
		$('#language-code').val(result['steam-sale-helper']['language-code']);
		$('#sale-type').val(result['steam-sale-helper']['sale-type']);
	});

	$('#save').click(function(){
		// save input data to local storage
		chrome.storage.local.set(
		{
			'steam-sale-helper':
			{
				'country-code': $('#country-code').val(),
				'language': $('#language').val(),
				'language-code': $('#language-code').val(),
				'sale-type': $('#sale-type').val()
			}
		});
	});
});
