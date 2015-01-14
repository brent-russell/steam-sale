$(document).ready(function(){
	$('#save').click(function(){
		$('input:not(#save)').each(function(){
			localStorage[this.id] = $(this).val();
		});
	});
});
