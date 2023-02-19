import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Song from './Song';
import Playlist from './Playlist';
import SearchBar from './SearchBar';
import Player from './Player';
import './ListenTo.css';

function ListenTo() {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fetch songs and playlists from the API when the component mounts
  useEffect(() => {
    axios.get('/api/songs')
      .then(response => setSongs(response.data));
    axios.get('/api/playlists')
      .then(response => setPlaylists(response.data));
  }, []);

  // Filter songs by search term
  const filteredSongs = songs.filter(song => song.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Handle playing and pausing of songs
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle skipping to the next song in the playlist
  const handleNextSong = () => {
    const index = currentPlaylist.findIndex(song => song.id === currentSong.id);
    if (index < currentPlaylist.length - 1) {
      setCurrentSong(currentPlaylist[index + 1]);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };
 function SongLyrics({ songName, artistName }) {
  const [lyrics, setLyrics] = useState("");

  useEffect(() => {
    axios.get(`https://api.lyrics.ovh/v1/${artistName}/${songName}`)
      .then(res => {
        setLyrics(res.data.lyrics);
      })
      .catch(err => {
        console.log(err);
      })
  }, [songName, artistName]);

  return (
    <div>
      <h3>Lyrics</h3>
      <p>{lyrics}</p>
    </div>
  );
}


  // Handle skipping to the previous song in the playlist
  const handlePrevSong = () => {
    const index = currentPlaylist.findIndex(song => song.id === currentSong.id);
    if (index > 0) {
      setCurrentSong(currentPlaylist[index - 1]);
      setIsPlaying(true);
    }
  };

  return (
    <div className="ListenTo">
      <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
      <div className="ListenTo-content">
        <div className="ListenTo-songs">
          <h2 className="ListenTo-title">All Songs</h2>
          <div className="ListenTo-songlist">
            {filteredSongs.map(song => (
              <Song key={song.id} song={song} onClick={() => {
                setCurrentSong(song);
                setCurrentPlaylist(filteredSongs);
                setIsPlaying(true);
              }} />
            ))}
          </div>
        </div>
        <div className="ListenTo-playlist">
          <h2 className="ListenTo-title">Playlist</h2>
          <div className="ListenTo-songlist">
            {currentPlaylist.map(song => (
              <Song key={song.id} song={song} isActive={song.id === currentSong?.id} onClick={() => {
                setCurrentSong(song);
                setIsPlaying(true);
              }} />
            ))}
          </div>
          <Playlist playlists={playlists} setCurrentPlaylist={setCurrentPlaylist} />
        </div>
      </div>
      <Player
        song={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNextSong}
        onPrev={handlePrevSong}
        currentTime={currentTime}
        duration={duration}
        onTimeUpdate={setCurrentTime}
        onDurationUpdate={setDuration}
      />
    </div>
  );
}

export default ListenTo;
