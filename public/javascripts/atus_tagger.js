$(function(){
	var atus_weight = undefined;
	//$('#image_text').removeClass('btn-outline-primary').addClass('btn-primary');
	$('.atus_weight_btn').on('click', function(){
		  $('.atus_weight_btn').removeClass('btn-primary').addClass('btn-outline-primary');
		  atus_weight = $(this).attr('code');
		  $(this).removeClass('btn-outline-primary').addClass('btn-primary');
	});
	$('.atus_category_btn').on('click', function(){
		if (!atus_weight){
		//do something
			alert('Image / Image_Text / Text 중 중요한걸 선택하세요');
		}
		else{
			$.post('/tagging', 
				{'shortcode': $('#myimg').attr('shortcode'),
				'category': $(this).attr('code'),
				'weight': atus_weight},
				function(data) {
					location.reload();
					document.body.scrollTop = 0; // For Safari
					document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
				}
			);
		}
	});
	$('#logout_btn').on('click', function(){
		if (confirm("Logout?")){
			$.post('/users/logout', function(data){
				window.location.href='/';
			});
		}
	})
});
