function displayTitle(title) {

    // make a similar title for all JS example presented in this course:
    let header = document.createElement("header");
    header.innerHTML = "<h1>&nbsp;" + title + "<br /></h1><br>&nbsp;&nbsp;WebGL2.0 par la pratique &copy; HE-Arc/HES-SO, 2022-2023";
    document.body.prepend(header);
    document.title = title;

    let url = window.location.pathname;
    let filename = url.substring(url.lastIndexOf('/') + 1);
    //console.log(filename);
}

export {displayTitle}
