var createSongRow = function (songNumber, songName, songLength) {
    var template =
      '<tr class="album-view-song-item">'
    + '        <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '        <td class="song-item-title">' + songName + '</td>'
    + '        <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
    + '</tr>'
    ;

    var $row = $(template);

    var clickHandler = function() {

        // find & store the song number of the clicked element
        var songNumber = parseInt($(this).attr('data-song-number'));

        if (currentlyPlayingSongNumber !== null) {

            // store the number of the selected song
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

            // change the content from the play button to the song number as user has chosen a new song
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }

        if (currentlyPlayingSongNumber !== songNumber) {

            // set currentlyPlayingSong to new song's number & currentSongFromAlbum to new value
            setSong(songNumber);

            // play the currentSoundFile
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();

            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});

            // set the songItem's content from play to pause
            $(this).html(pauseButtonTemplate);

            // change player bar accordingly
            updatePlayerBarSong();

        } else if (currentlyPlayingSongNumber === songNumber) {

            // check if currentSoundFile is paused - use Buzz method `isPaused()`
            if (currentSoundFile.isPaused()) {

                // restart song to play - use Buzz method `play()`
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();

                // revert song row to pause
                $(this).html(pauseButtonTemplate);

                // revert player bar icon to pause
                $('.main-controls .play-pause').html(playerBarPauseButton);

            } else {

                // stop the song - use Buzz method `pause()`
                currentSoundFile.pause();

                // set song number cell content to play
                $(this).html(playButtonTemplate);

                // set player bar's pause button back to play
                $('.main-controls .play-pause').html(playerBarPlayButton);
            }
        }
    };

    var onHover = function(event) {

        // find & store song item number of hover target
        var songNumberCell = $(this).find('.song-item-number');

        // get & store song number of songNumberCell
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));


        // if the clicked element is not the currently playing song
        if(songNumber !== currentlyPlayingSongNumber) {

            // Change the content from the number to the play button
            songNumberCell.html(playButtonTemplate);
         }
     };

    var offHover = function(event) {

        // find & store song item number of hover target being left
        var songNumberCell = $(this).find('.song-item-number');

        // get & store song number of that songNumberCell
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        // if the target being left is not the currently playing song
        if(songNumber !== currentlyPlayingSongNumber) {

            // !!! Change the content to the current song number
            songNumberCell.html(songNumber);
        }
    };

    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

var setCurrentAlbum = function (album) {

    // set the function argument to the current album
    currentAlbum = album;

    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    // ensures song list is empty
    $albumSongList.empty();

    // loop through the album's available songs & create a row for each with song title & duration
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var setSong = function(songNumber) {

    // check if a song is already playing
    if(currentSoundFile) {
        // if true - stop the song
        currentSoundFile.stop();
    }

    // assign value to currentlyPlayingSongNumber
    currentlyPlayingSongNumber = parseInt(songNumber);

    // assign value to currentSongFromAlbum
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

    // assign new Buzz 'sound' object
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioURL, {
        // indicates song file type
        formats: ['mp3'],
        // tells Buzz to load the songs as soon as the page loads
        preload: true
    });

    // control song volume
    setVolume(currentVolume);
};

 

 

var nextSong = function(skip=1) {

    // find & store the last song played
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };
    // use trackIndex() to get the current song's index & then increment the value of the index
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    
    // ===========================
    // ===========================
    document.getElementsByClassName('song-item-number')[currentSongIndex].innerHTML = currentSongIndex + 1;
    currentSongIndex += skip;

    // account for the next song being the first song, as when you're on the final song, you should wrap around to the first song
    if(currentSongIndex >= currentAlbum.songs.length) { currentSongIndex %= currentAlbum.songs.length; }
    // ===========================
    // ===========================

    // set the new current song to currentSongFromAlbum
    setSong(currentSongIndex + 1);

    // play songs when skipping
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    // update the player bar to show the new song
    updatePlayerBarSong();

    // update the html of the previous song's '.song-item-number' element with a number
    var lastSongNumber = getLastSongNumber(currentSongIndex);

    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);

    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    $lastSongNumberCell.html(lastSongNumber);

    // update the html of the new song's '.song-item-number' element with a pause button
    $nextSongNumberCell.html(pauseButtonTemplate);
};

var previousSong = function() {

    // find & store the last song
    var getLastSongNumber = function(index) {
        return index ==  (currentAlbum.songs.length - 1) ? 1 : index + 2 ;
    };

    // use trackIndex() to get the current song's index & then decrement the value of the index
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;

    //account for the previous song being the last song, as when you're on the first song, you should wrap around to the last song
    if(currentSongIndex < 0) {currentSongIndex = currentAlbum.songs.length - 1;}

    // set the new current song to currentSongFromAlbum
    setSong(currentSongIndex + 1);

    // play songs when skipping
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    // update the player bar to show the new song
    updatePlayerBarSong();

    // update the html of the following song's '.song-item-number' element with a number
    var lastSongNumber = getLastSongNumber(currentSongIndex);

    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);

    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    $lastSongNumberCell.html(lastSongNumber);

    // update the html of the new song's '.song-item-number' element with a pause button
    $previousSongNumberCell.html(pauseButtonTemplate);

};


 
// updates player bar text to show current song title & for mobile devices - song title + artist
var updatePlayerBarSong = function() {

    // change currently playing song name to currentSongFromAlbum's title
    $('.currently-playing .song-name').text(currentSongFromAlbum.title+'  '+':Playing Now');

    // change the content of the '.artist-name' to currentAlbum.artist
    $('.currently-playing .artist-name').text(currentAlbum.artist);

    // change content of the '.artist-song-mobile' to song title & artist
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);

    // change play icon to pause on player bar
    $('.main-controls .play-pause').html(playerBarPauseButton);

    // update total time info when a song plays
    var totalTime = currentSongFromAlbum.duration;
    setTotalTimeInPlayerBar(filterTimeCode(totalTime));
};

var togglePlayFromPlayerBar = function() {
    // if song is paused & play button is clicked
    if (currentSoundFile.isPaused()) {

        // change song number cell from play to pause icon
        $((getSongNumberCell(currentlyPlayingSongNumber))).html(pauseButtonTemplate);

        // change html of player bar's play button to pause
        $('.main-controls .play-pause').html(playerBarPauseButton);

        // play the song
        currentSoundFile.play();

    } // else - if song is playing & pause button is clicked
    else {

        // change song number cell from pause to play icon
        $((getSongNumberCell(currentlyPlayingSongNumber))).html(playButtonTemplate);

        // change html of player bar's pause button to play
        $('.main-controls .play-pause').html(playerBarPlayButton);

        // pause the song
        currentSoundFile.pause();
    }
};


var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {

        // bind timeupdate event - Buzz method - fires repeatedly while time elapses during song playback
        currentSoundFile.bind('timeupdate', function(event) {

            // use Buzz method getTime() & getDuration() methods - both return values in seconds units
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekBarPercentage($seekBar, seekBarFillRatio);

            // display current playback time in seconds
            var currentTime = this.getTime();
            setCurrentTimeInPlayerBar(filterTimeCode(currentTime));
        });

        // bind ended event
        currentSoundFile.bind('ended', function (event) {
            if (window.shouldPlayAll) {
                var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
                if (currentSongIndex < currentAlbum.songs.length - 1) {
                    nextSong(1);
                } else {
                    window.shouldPlayAll = false;
                }
            }
        });
    }
};

var updateSeekBarPercentage = function($seekBar, seekBarFillRatio) {

    // multiply ratio by 100 to get percentage
    var offsetXPercent = seekBarFillRatio * 100;

    // make sure percentage isn't less than 0 or more than 100
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    // convert percentage to string
    var percentageString = offsetXPercent + '%';

    // allows css to interpret string as percentage instead of unit-less number
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    // find all elements in the DOM with '.seek-bar' class with the '.player-bar' parent class, returns an array with both the song duration & volume seekbars
    var $seekBars = $('.player-bar .seek-bar');

    // whichever seekbar is clicked
    $seekBars.click(function(event) {

        // subtract left offset of where song duration was at moment of event from point of click event - returns proportion of seek bar
        var offsetX = event.pageX - $(this).offset().left;

        // returns total width of selected bar
        var barWidth = $(this).width();

        var seekBarFillRatio = offsetX / barWidth;

        // if the clicked seekbar is the playback bar, seek to the position of the song determined by seekBarFillRatio
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());

        } // else set the volume based on seekBarFillRatio

        else {
            setVolume(seekBarFillRatio * 100);
        }

        updateSeekBarPercentage($(this), seekBarFillRatio);
    });

    // find elements with '.thumb' class in the seekbars and add an event listener for mousedown event
    $seekBars.find('.thumb').mousedown(function(event) {

        // 'this' = the '.thumb' node that was clicked, finds the clicked element's parent to id which seekbar we're dealing with
        var $seekBar = $(this).parent();

        // '.bind()' allows us to namespace event listeners - the event handler inside the bind() call behaves the same as a .click - in this case .thumb is an arbitrary identifier - namespace - and is not the same as the css selector used above
        // mousemove allows user to continue control event if mouse moves away from seekbar as long as mousedown is still in effect
        $(document).bind('mousemove.thumb', function(event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            // if the clicked seekbar is the playback bar, seek to the position of the song determined by seekBarFillRatio
            if ($(this).parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());

            } // else set the volume based on seekBarFillRatio

            else {
                setVolume(seekBarFillRatio * 100);
            }

            updateSeekBarPercentage($seekBar, seekBarFillRatio);
        });

        $(document).bind('mouseup.thumb', function() {
            // removes previous event listeners so control stops when user releases mouse button
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};


// returns the index of a song found in the album's song array
var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var getSongNumberCell = function(number){
    return $('.song-item-number[data-song-number="' + number + '"]');
};

// change the position in a song's playback to a specified time
var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setCurrentTimeInPlayerBar = function(currentTime) {
    // sets the text of the element '.current-time' class to the current time in the song
    $('.current-time').text(currentTime);
};

var setTotalTimeInPlayerBar = function(totalTime) {
    // sets the text of the element '.total-time' class to length of song
    $('.total-time').text(totalTime);
};

var filterTimeCode = function(timeInSeconds) {

    // use parseFloat() to get the seconds in number form
    timeInSeconds = parseFloat(timeInSeconds);

    // store variables for whole seconds and whole minutes *use Math.floor() to round numbers DOWN
    var minutes = Math.floor(timeInSeconds / 60);

    var seconds = Math.floor((timeInSeconds % 60));
    if(seconds < 10){
        seconds = '0' + seconds;
    };

    // return the time in the format: 'X:XX'
    return minutes + ':' + seconds;
};

// if a song is playing, set the volume
var setVolume = function(volume) {
    if(currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};


// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

// Placeholder for current album
var currentAlbum = null;

// Placeholder for playing song
var currentlyPlayingSongNumber = null;

// Placeholder for currently selected song on the currently selected album
var currentSongFromAlbum = null;

// Placeholder for 'sound' object - reference Buzz constructor
var currentSoundFile = null;

// Set initial song volume - Buzz 1-100 scale
var currentVolume = 80;

// Variables to hold jQuery selectors for next, previous & play/pause buttons on player bar
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');
var $playAllButton = $('.main-controls .play-all');
var $playModeButton = $('.main-controls .play-mode');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    $previousButton.click(previousSong);
    $nextButton.click(function (e) {
        if (mode === 'onebyone') {
            nextSong(1);
        } else {
            var skip = Math.floor(Math.random() * (currentAlbum.songs.length - 1) + 1);
            nextSong(skip);
        }
    });
    $playPauseButton.click(togglePlayFromPlayerBar);
    $playAllButton.click(playAll);
    $playModeButton.click(togglePlayMode);
    setupSeekBars();
});

var playAll = function (e) {
    window.shouldPlayAll = true;
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    nextSong(-currentSongIndex);
}


var mode = 'onebyone';
var modeSpan = $('.main-controls .play-mode span');
var togglePlayMode = function () {
    modeSpan.removeClass('ion-skip-forward ion-skip-backward').addClass(mode === 'onebyone' ? 'ion-skip-backward' : 'ion-skip-forward');
    mode = mode === 'onebyone' ? 'random' : 'onebyone';
}
