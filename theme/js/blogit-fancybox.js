// blogit fancybox suport

$(document).ready(function() {
    $(".fancybox").fancybox();

    // Parse html and add fancybox support
    var block = document.getElementsByClassName('figure');
    for(var i = 0, l = block.length; i < l; i++) {
        block[i].innerHTML = block[i].innerHTML.replace(/(\<img src=\"(.+)\"\s([^/]+)\>)/, '<a class="fancybox" rel="group" href="$2">$1</a>');
    }
});
