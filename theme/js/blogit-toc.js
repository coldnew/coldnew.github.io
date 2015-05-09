// Generate table-of-contents for blogit

(function () {
    var header =
            "<nav role='navigation' class='table-of-contents'>" +
            "<h2>Table of Contents</h2>" +
            "<ul>";
    var content = "";
    var footer = "</ul>" + "</nav>";

    var newLine, el, title, link;
    $("article h2").each(function() {

        el = $(this);
        title = el.text();
        link = "#" + el.attr("id");

        newLine =
            "<li>" +
            "<a href='" + link + "'>" +
            title +
            "</a>" +
            "</li>";

        content += newLine;
    });

    // Only prepend when content not empty
    if (content) {
        $(".table-of-contents").prepend(header + content + footer);
    }

})();
