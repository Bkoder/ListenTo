const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Song = require('./models/Song');
const Playlist = require('./models/Playlist');
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Song from './Song';
import Playlist from './Playlist';
import SearchBar from './SearchBar';
import Player from './Player';
import './ListenTo.css';

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost/listento', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to database');
});

// Get all songs
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await Song.find({});
    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all playlists
app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find({});
    res.json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new playlist
app.post('/api/playlists', async (req, res) => {
  const { name, songs } = req.body;

  try {
    const playlist = new Playlist({ name, songs });
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a playlist
app.put('/api/playlists/:id', async (req, res) => {
  const { name, songs } = req.body;

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { name, songs },
      { new: true }
    );
    res.json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a playlist
app.delete('/api/playlists/:id', async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
// ListenTo.js



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
