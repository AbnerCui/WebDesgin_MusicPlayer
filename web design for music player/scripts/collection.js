var buildCollectionItemTemplate = function() {
    var template =
    '<div class="collection-album-container column fourth">'
  + '    <a href="album.html"> <img src="assets/images/album_covers/21.png"/>  </a>'

  + '    <div class="collection-album-info caption">'
  + '      <p>'
  + '        <a class="album-name" href="album.html"> The type of Sample Music </a>'
  + '        <br/>'
  + '        <a href="album.html"> Singer </a>'
  + '        <br/>'
  + '        5 songs'
  + '        <br/>'
  + '      </p>'
  + '   </div>'
  + '</div>'
;
    return $(template);
};

$(window).load(function() {

    var $collectionContainer = $('.album-covers');

    $collectionContainer.empty();

    for (var i = 0; i < 2; i++) {
        var $newThumbnail = buildCollectionItemTemplate();
        $collectionContainer.append($newThumbnail);
    }
});
