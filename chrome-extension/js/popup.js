$(document).ready(function(){
	// populate input form with values from local storage
	$('input:not(#save)').each(function(){
		$(this).val(localStorage[this.id]);
	});

	$('#save').click(function(){
		// save input data to local storage
		$('input:not(#save)').each(function(){
			localStorage[this.id] = $(this).val();
		});
	});
});
