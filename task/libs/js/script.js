$('#btn1').click(function() {

	$.ajax({
		url: "libs/php/postalCodeCountryInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			// country: $('#selCountry').val(),
			// lang: $('#selLanguage').val()
		},
		success: function(result) {

			console.log(JSON.stringify(result));

			if (result.status.name == "ok") {

				if (result.data?.status?.message) {
					$('#result').html(result.data.status.message);
				}
				else {
					let first = result.data.geonames[0];
					$('#result').html(`<div>numPostalCodes: ${first.numPostalCodes}<br>maxPostalCode: ${first.maxPostalCode}<br>
					countryCode: ${first.countryCode}<br>minPostalCode:${first.minPostalCode}<br>countryName:${first.minPostalCode}</div>`);
			}

			}
		
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
		}
	}); 

});

$('#btn2').click(function() {

	$.ajax({
		url: "libs/php/geoCodeAddress.php",
		type: 'POST',
		dataType: 'json',
		data: {
			 q: encodeURIComponent($('#q').val()),
			 
		},
		success: function(result) {

			console.log(JSON.stringify(result));

			if (result.status.name == "ok") {

				if (result.data?.status?.message) {
					$('#result').html(result.data.status.message);
				}
				else {
					$('#result').html(`<div>lat: ${result.data.address.lat}<br>lng: ${result.data.address.lng}<br>
				</div>`);
				}
			
				

			}
		
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
		}
	}); 

});

$('#btn3').click(function() {

	$.ajax({
		url: "libs/php/getSRTM1.php",
		type: 'POST',
		dataType: 'json',
		data: {
			lat: $('#lat').val(),
			lng: $('#lng').val()
		},
		success: function(result) {

			console.log(JSON.stringify(result));

			if (result.status.name == "ok") {

				if (result.data?.status?.message) {
					$('#result').html(result.data.status.message);
				}
				else {
					$('#result').html(`srtm1: ${result['data']['srtm1']}`);
				}

			}
		
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
		}
	}); 

});

