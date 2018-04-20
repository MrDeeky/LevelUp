// Code for handling clicks for taskbar elements adapted from http://jsfiddle.net/r0e11z9p/
// AJAX Call code adapted from http://jsfiddle.net/LGqD3/

var app = angular.module('app',[]);
app.controller('Test',function($scope){
		$scope.show = 1;

});

const ul = document.getElementById('images');
const proxy = 'https://cors-anywhere.herokuapp.com/'
const baseUrl = 'https://www.giantbomb.com/api/game/'
const endUrl = '/?api_key=4c1064b86306a1211d5acb14b7b5ec30a3772ffb&format=json&field_list=name,image'

function getImage(id) {
    fullUrl = baseUrl + id + endUrl;
    console.log(fullUrl);
    
    // construct the uri with our apikey
    var GamesSearchUrl = proxy + baseUrl + id + endUrl;

    $(document).ready(function() {

      // send off the query
      $.ajax({
        url: GamesSearchUrl,
        dataType: "json",
        success: searchCallback
      });


        // callback for when we get back the results
        function searchCallback(data) {
            console.log(data);
            console.log(data.results.name);
            console.log(data.results.image.medium_url);
            var caption = document.createElement("FIGCAPTION");
            var captionText = document.createTextNode(data.results.name);
            caption.appendChild(captionText);

            i = $('<img/>', { src: data.results.image.medium_url, height: 500, width: 350 }).after(caption);
            $('#' + id).append(i);
        }
    });
}

const endUrl2 = '/?api_key=4c1064b86306a1211d5acb14b7b5ec30a3772ffb&format=json'
function setDescriptionPage(id) {
    fullUrl = baseUrl + id + endUrl2;
    console.log(fullUrl);
    $('#descriptionTitle').text(" ");
    $('#images').empty();
    $('#description').empty();

    // construct the uri with our apikey
    var GamesSearchUrl = proxy + baseUrl + id + endUrl2;

    $(document).ready(function() {

      // send off the query
      $.ajax({
        url: GamesSearchUrl,
        dataType: "json",
        success: searchCallback
      });


        // callback for when we get back the results
        function searchCallback(data) {
            $('#descriptionTitle').text(data.results.name);
            i = $('<img/>', { src: data.results.image.medium_url, height: 500, width: 350});
            $('#images').append(i);
            $('#description').append(data.results.description);
        }
    });
}

