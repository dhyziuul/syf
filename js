/* eslint-disable no-use-before-define */
(function nunuSmart() {
  if (document.querySelector('#smiles-panel')) return;
  $('#userlist').hide();
  const smilesBtn = document.createElement('span');
  const smilesPanel = document.createElement('div');

  smilesPanel.id = 'smiles-panel';
  smilesBtn.id = 'smilesBtn';
  let chatline = document.getElementById('chatline');
  document.querySelector('#chatwrap').insertBefore(smilesBtn, chatline);
  // document.querySelector('#chatwrap').appendChild(smilesBtn);
  document.querySelector('#chatwrap').appendChild(smilesPanel);

  // hide smiles panel
  $('#smiles-panel').toggleClass('hidden');

  smilesBtn.addEventListener('click', () => {
    $('#smiles-panel').toggleClass('hidden');
  });

  const chatWrap = {
    top: 10,
    left: 10,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    moving: false,
  };

  const chat = document.getElementById('chatwrap');

  function setChatPosition(coor) {
    const { left, top } = coor;
    chat.style.left = `${left}px`;
    chat.style.top = `${top}px`;
    chat.style.position = 'fixed';
  }

  function resetChatStyle() {
    chat.style.left = '';
    chat.style.top = '';
    chat.style.position = '';
    chat.style.height = '';
    chat.style.width = '';
  }

  function handleMove(e) {
    const left = chatWrap.startX + e.clientX - chatWrap.baseX;
    const top = chatWrap.startY + e.clientY - chatWrap.baseY;
    setChatPosition({ left, top });
  }

  function saveCoords(e) {
    chatWrap.moving = true;
    chatWrap.baseX = e.clientX;
    chatWrap.baseY = e.clientY;
    const rect = chat.getBoundingClientRect();
    chatWrap.startX = rect.left;
    chatWrap.startY = rect.top;
    const left = chatWrap.startX + e.clientX - chatWrap.baseX;
    const top = chatWrap.startY + e.clientY - chatWrap.baseY;
    setChatPosition({ left, top });
  }
  document.addEventListener('mousedown', e => {
    const { target } = e;
    const html = document.documentElement;
    const video = document.getElementById('videowrap');
    if (!html.classList.contains('compact')) return;
    const { id } = target;
    if (id.includes('chatheader')) {
      saveCoords(e);
      chat.classList.add('no-select');
      video.style.pointerEvents = 'none';
    }
  });

  document.addEventListener('mouseup', e => {
    chatWrap.moving = false;
    chat.classList.remove('no-select');
    const video = document.getElementById('videowrap');
    video.style.pointerEvents = '';
  });

  document.addEventListener('mousemove', e => {
    if (chatWrap.moving) handleMove(e);
  });

  for (let smiles = CHANNEL.emotes, n = 0, smilesLen = smiles.length; smilesLen > n; n++) {
    $("<img class='channel-emote popup-emote'>")
      .attr({
        src: smiles[n].image,
        id: smiles[n].name,
      })
      .appendTo($("<div class='emote-container'>").appendTo('#smiles-panel'));
  }

  $('.popup-emote').on('click', e => {
    insertText(e.currentTarget.id);
  });

  function insertText(smileName) {
    const currentChatPos = $('#chatline')[0].selectionStart;
    const currentChatVal = $('#chatline')[0].value;
    const chatLength = currentChatVal.length;
    let inputPattern = null;
    const chatValStart = currentChatVal.substring(0, currentChatPos);
    const chatValEnd = currentChatVal.substring(currentChatPos, chatLength);
    const smileBefore = currentChatVal.substring(currentChatPos - 1, currentChatPos);
    const smileAfter = currentChatVal.substring(currentChatPos, currentChatPos + 1);
    const sB = /[ ]/.exec(smileBefore);
    const sA = /[ ]/.exec(smileAfter);
    const lnB = /(\r|\n)/.exec(smileBefore);
    const lnA = /(\r|\n)/.exec(smileAfter);
    let s = 2;
    let spaceL;
    let spaceR;
    if (!sB && !lnB && chatLength) {
      spaceL = ' ';
      s++;
    } else {
      spaceL = '';
    }
    if ((!sA && !lnB && !lnA) || (!sB && !sA) || (!sA && !lnB)) {
      spaceR = ' ';
      s++;
    } else {
      spaceR = '';
    }
    inputPattern = `${chatValStart}${spaceL}${smileName}${spaceR}${chatValEnd}`;
    $('#chatline')[0].value = inputPattern;
    $('#chatline')[0].selectionStart = currentChatPos + smileName.length + s;
    $('#chatline')[0].selectionEnd = currentChatPos + smileName.length + s;
    $('#chatline')[0].focus();
  }

  /* ============================================================Кусь============================================================ */

  // Resize buttons
  const resizeMaxBtn = document.createElement('span');
  const resizeMinBtn = document.createElement('span');
  const compactButton = document.createElement('span');

  resizeMaxBtn.id = 'resize-video-larger';
  resizeMinBtn.id = 'resize-video-smaller';
  compactButton.id = 'fullscreen-mode';

  resizeMaxBtn.className = 'glyphicon glyphicon-plus pointer';
  resizeMinBtn.className = 'glyphicon glyphicon-minus pointer';
  compactButton.className = 'glyphicon glyphicon-fullscreen pointer';

  document.querySelector('#videowrap').appendChild(resizeMaxBtn);
  document.querySelector('#videowrap').appendChild(resizeMinBtn);
  document.querySelector('#videowrap').appendChild(compactButton);

  $('#resize-video-larger').click(function() {
    changeVideoWidth(1);
  });

  $('#resize-video-smaller').click(function() {
    changeVideoWidth(-1);
  });

  $('#fullscreen-mode').click(function() {
    const html = document.documentElement;
    html.classList.toggle('compact');
    if (!html.classList.contains('compact')) resetChatStyle();
    scrollToBottom(); // chat
    window.scrollTo(0, 0);
  });

  function changeVideoWidth(e) {
    const a = document.getElementById('videowrap');
    const n = document.getElementById('leftcontrols');
    const s = document.getElementById('leftpane');
    const o = document.getElementById('chatwrap');
    const i = document.getElementById('rightcontrols');
    const r = document.getElementById('rightpane');
    const l = a.className.match(/col-md-(\d+)/);
    if (!l) {
      throw new Error('ui::changeVideoWidth: videowrap is missing bootstrap class!');
    }
    const d = parseInt(l[1], 10) + e;
    if (!(d < 3 || d > 9)) {
      const p = 12 - d;
      a.className = `col-md-${d} col-lg-${d}`;
      i.className = `col-md-${d} col-lg-${d}`;
      r.className = `col-md-${d} col-lg-${d}`;
      o.className = `col-md-${p} col-lg-${p}`;
      n.className = `col-md-${p} col-lg-${p}`;
      s.className = `col-md-${p} col-lg-${p}`;
      // eslint-disable-next-line no-undef
      handleVideoResize();
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    document.getElementById('messagebuffer').scrollTo(0, 10000);
  }

  window.addEventListener('resize', function() {
    scrollToBottom();
  });
  /* ============================================================Кусь============================================================ */

  // Search smiles
  $('#chatwrap').append('<div id="popup-smiles"></div>');
  chatline = $('#chatline');
  let foundSmiles;
  let nc = 0;
  $('#chatline').on('input', e => {
    const chatlineVal = chatline.val().toLowerCase();
    const foundSmile = chatlineVal.match(/:\w{2,}$/i);
    if (foundSmile) {
      nc = 0;
      clearSmiles(() => {
        findSmileByName(foundSmile[0]);
      });
    } else {
      clearSmiles();
    }
  });
  chatline.keydown(e => {
    const curSmile = document.querySelectorAll('.curSmile')[0];
    const shownSmiles = document.querySelectorAll('#popup-smiles img');
    if (e.keyCode === 32 || e.keyCode === 27) {
      clearSmiles();
    } else if (!e.shiftKey && e.keyCode === 9 && foundSmiles) {
      if (nc === foundSmiles.length - 1) {
        nc = 0;
      } else {
        nc++;
      }
      curSmile.classList.remove('curSmile');
      shownSmiles[nc].classList.add('curSmile');
    } else if (e.shiftKey && e.keyCode === 9 && foundSmiles) {
      if (nc < 1) {
        nc = foundSmiles.length - 1;
      } else {
        nc--;
      }
      curSmile.classList.remove('curSmile');
      shownSmiles[nc].classList.add('curSmile');
    } else if (e.keyCode === 13 && foundSmiles && foundSmiles.length) {
      insertSmileInChat(shownSmiles[nc].id);
    }
  });
  document.addEventListener('keydown', e => {
    const activeElement = document.activeElement.tagName.toLowerCase();
    const code = e.keyCode;
    if (
      ((code >= 48 && code <= 90) || (code >= 186 && code <= 192)) &&
      activeElement !== 'input' &&
      activeElement !== 'textarea' &&
      !e.ctrlKey
    ) {
      chatline.focus();
    }
  });

  function findSmileByName(smileName) {
    foundSmiles = $.grep(CHANNEL.emotes, (n, i) => n.name.includes(smileName.replace(':', '')));
    if (foundSmiles) {
      for (const i in foundSmiles) {
        renderSmileInBlock(foundSmiles[i].name, foundSmiles[i].image);
        CHATTHROTTLE = true;
      }
    }
    const elem = document.querySelectorAll('#popup-smiles img')[0];
    elem ? elem.classList.add('curSmile') : null;
  }

  function renderSmileInBlock(name, url) {
    $('#popup-smiles').prepend(`<img class="popup-emote" id="${name}" src="${url}" title="${name}">`);
  }

  function clearSmiles(callback) {
    $('#popup-smiles').empty();
    CHATTHROTTLE = false;
    foundSmiles = 0;
    nc = 0;
    if (callback) {
      callback();
    }
  }
  const smileMainButton = document.getElementById('smilesBtn');

  document.addEventListener('click', e => {
    if (e.target.id !== 'smilesBtn' && e.target.id !== 'smiles-panel') {
      document.getElementById('smiles-panel').classList.add('hidden');
    }
  });

  $('#chatwrap').on('click', '.popup-emote', e => {
    insertSmileInChat(e.target.id);
  });

  function insertSmileInChat(smileName) {
    if (smileName === undefined) {
      console.log(nc);
      console.log(smileName);
      console.log(foundSmiles);
    } else {
      const chatval = chatline.val();
      chatline.val(chatval.replace(/:\w{2,}$/i, `${smileName} `));
      chatline.focus();
      clearSmiles();
    }
  }

  $('#qlockbtn').attr('class', 'btn btn-sm btn-default');

  /* ============================================================Кусь============================================================ */

  let timer;
  const delay = 50;
  createImgs();
  observer();

  function createImgs() {
    const buffer = $('#messagebuffer a');
    for (let i = 0; i < buffer.length; i++) {
      if (!buffer[i].innerHTML.match(/(.(jpg|png|jpeg|gif)(\?.*?|)$)|twimg/) || $('#messagebuffer a .hoverover')[i]) {
        continue;
      }
      buffer[i].innerHTML = `${buffer[i].innerHTML}<span class="hoverover">👈🏻</span>`;
      $(buffer[i]).hover(
        function() {
          timer = setTimeout(function() {
            try {
              $('#chatwrap').append($(`<img class="image_hover" src="${buffer[i].href}"></img>`));
            } catch (error) {
              return console.error(error);
            }
          }, delay);
        },
        function() {
          clearTimeout(timer);
          try {
            $(document.querySelector('#chatwrap').getElementsByClassName('image_hover')).remove();
          } catch (error) {
            return console.error(error);
          }
        }
      );
    }
  }

  function observer() {
    const DOMObserverConfig = {
      attributes: false,
      childList: true,
      subtree: false,
    };
    const DOMObserver = new MutationObserver(function() {
      createImgs();
      n = document.querySelector('#userlist').childElementCount;
      appendProfileInfo(userProfile);
    });
    DOMObserver.observe(document.getElementById('messagebuffer'), DOMObserverConfig);
  }

  const css = document.createElement('style');
  css.type = 'text/css';
  const styles =
    '.hoverover{color: #d0d0d0; font-style: italic; font-size: 1em!important;vertical-align: text-bottom;margin: 0;padding: 0!important;}.image_hover {position: absolute !important;right: 13px;top: 15px;margin: auto;z-index: 100;height: auto;width: auto;max-height: 60%;max-width: 60%;}.curSmile {background: #6b91ac}';
  if (css.styleSheet) css.styleSheet.cssText = styles;
  else css.appendChild(document.createTextNode(styles));
  document.getElementsByTagName('head')[0].appendChild(css);

  /* ============================================================Кусь============================================================ */
  let userProfile;
  if (localStorage.getItem('userProfile')) {
    userProfile = JSON.parse(localStorage.getItem('userProfile'));
  } else {
    userProfile = [];
  }
  const defaultImage = '';
  function getProfileInfo(n) {
    let userColor;
    for (let i = 1; i < n + 1; i++) {
      const name = $(`.userlist_item:nth-child(${i})`).data('name');
      let { image } = $(`.userlist_item:nth-child(${i})`).data('profile');
      try {
        userColor = $(`.userlist_item:nth-child(${i})`)
          .data('profile')
          .text.match(/color=((#(\w{6}|\d{3}))|((rgba|rgb|hsl|hsla)\(.*\)))$/gim)[0]
          .replace(/color=/i, '');
      } catch (error) {
        userColor = '';
      }
      if (!image.match(/(.(jpg|png|jpeg|gif)(\?.*?|)$)|twimg/)) image = defaultImage;
      userProfile.push({ name: `${name}`, image: `${image}`, color: `${userColor}` });
    }
    userProfile = userProfile
      .reverse()
      .filter((userProfile, index, self) => self.findIndex(t => t.name === userProfile.name) === index)
      .reverse();
    setTimeout(() => {
      appendProfileInfo(userProfile);
    }, 80);
  }
  function appendProfileInfo(userProfile) {
    /* if (error) return console.log('Something went wrong') */
    let messages;
    let messagesCount;
    try {
      messages = document.querySelector('#messagebuffer').querySelectorAll('div[class^="chat-msg"]');
    } catch (err) {
      return console.error(err);
    }
    messagesCount = messages.length;
    for (let i = 0; i < messagesCount; i++) {
      if (!messages[i].getElementsByClassName('username')[0]) continue;
      if (messages[i].getElementsByClassName('username')[0].className === 'username checked') continue;
      const usernameClass = messages[i].getElementsByClassName('username')[0];
      let profileImageUrl = null;
      let userColor;
      usernameClass.className = 'username checked';
      const actualUsername = usernameClass.innerText.slice(0, -2);
      usernameClass.innerText = `${actualUsername} `;
      if (!userProfile.find(userProfile => userProfile.name === `${actualUsername}`)) {
        userProfile.push({ name: `${actualUsername}`, image: `${defaultImage}` });
      }
      try {
        profileImageUrl = userProfile.find(userProfile => userProfile.name === `${actualUsername}`).image;
      } catch (err) {
        console.error(`Something wrong with ${actualUsername}. ${err}`);
        continue;
      }
      try {
        userColor = userProfile.find(userProfile => userProfile.name === `${actualUsername}`).color;
      } catch (err) {
        userColor = '';
      }
      usernameClass.style.color = userColor;
      const profileImage = document.createElement('span');
      profileImage.className = 'profileImage';
      profileImage.style.backgroundImage = `url(${profileImageUrl})`;
      document.querySelector('#chatwrap').appendChild(smilesBtn);
      usernameClass.parentNode.insertBefore(profileImage, usernameClass);
    }
    try {
      createStatusBadges();
    } catch (err) {
      console.error(err);
    }
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }
  function createStatusBadges() {
    const e = document.getElementsByClassName('profileImage');
    for (let i = 0; i < e.length; i++) {
      if (e[i].getElementsByClassName('status')[0]) continue;
      const onlineStatus = document.createElement('span');
      onlineStatus.className = 'status';
      e[i].appendChild(onlineStatus);
    }
    changeStatusBadges(e);
  }
  function changeStatusBadges(e, error) {
    if (error) return console.error('Something went wrong...', error);
    const userlist = makeUserList();
    for (let i = 0; i < e.length; i++) {
      const nameCheck = e[i].parentNode.getElementsByClassName('username')[0].innerText.slice(0, -1);
      const pattern = `^${nameCheck}$`;
      const rgxp = new RegExp(pattern, `gm`);
      if (userlist.match(rgxp)) {
        e[i].getElementsByClassName('status')[0].className = 'status status_online';
      } else {
        e[i].getElementsByClassName('status')[0].className = 'status status_offline';
      }
    }
  }

  function makeUserList() {
    const userListDivs = document.querySelector('#userlist').querySelectorAll('.userlist_item');
    const amountOfUsers = userListDivs.length;
    let userList = '';
    for (let i = 0; i < amountOfUsers; i++) {
      userList = `${userList + userListDivs[i].querySelectorAll('span')[1].innerText}\n`;
    }
    return userList;
  }
  n = document.querySelector('#userlist').childElementCount;
  getProfileInfo(n);
  (function userCount() {
    const DOMObserverConfig = {
      attributes: false,
      childList: true,
      subtree: false,
    };
    const DOMObserver = new MutationObserver(function() {
      n = document.querySelector('#userlist').childElementCount;
      getProfileInfo(n);
    });
    DOMObserver.observe(document.getElementById('userlist'), DOMObserverConfig);
  })();
  // let PLAYER, FileReader, VTTCue
  function subtitles() {
    const getSubUrl = () => {
      const mediaUrl = PLAYER.mediaId;
    //   if (mediaUrl.includes('stream.bona.cafe')) {
        console.log(mediaUrl.replace(/\.\w{1,5}$/gim, '.srt'));
        return mediaUrl.replace(/\.\w{1,5}$/gim, '.srt');
    //   }
      return 'https://raw.githubusercontent.com/nunuju/synchtube-files/master/subs.srt';
    };
    // let subUrl = 'https://up.bona.cafe/sub.srt'

    // let subUrl = 'https://raw.githubusercontent.com/nunuju/synchtube-files/master/subs.srt'
    // if (mediaUrl.includes('stream.bona.cafe')) {
    //   subUrl = mediaUrl.replace(/\.\w{1,5}$/mgi, '.srt')
    // }
    let curUrl;
    let player;
    let subtitleObject;
    let track;
    let job = false;
    playerReady();
    function playerReady() {
      if (PLAYER && PLAYER.constructor.name === 'FilePlayer') {
        fetchSubs();
        // videoChange()
      } else {
        setTimeout(() => {
          playerReady();
        }, 1000);
      }
    }

    function fetchSubs() {
      const subUrl = getSubUrl();
      job = true;
      const myInit = { method: 'GET', mode: 'cors', cache: 'default' };
      fetch(subUrl, myInit)
        .then(function(response) {
          return response.blob();
        })
        .then(function(myBlob) {
          const reader = new FileReader();
          reader.onload = function() {
            const str = reader.result;
            subtitleObject = parser.fromSrt(str);
            if (subtitleObject) addTrack();
          };
          reader.readAsText(myBlob);
        });
    }

    function addTrack() {
      try {
        player = PLAYER.player.el_.querySelector('video');
        if (player.textTracks[0]) {
          job = false;
          return;
        }
        curUrl = PLAYER.mediaId;
        track = player.addTextTrack('captions', 'English', 'en');
        // PLAYER.player.controlBar.captionsButton.options_.tracks.tracks_[0] = track
        track.mode = 'showing';
        appendSubs(track);
        handleCaptButton(captButtonState);
      } catch (error) {
        console.log(error);
        appendSubs(track);
      }
    }

    function appendSubs(track) {
      for (let i = 0; i < subtitleObject.length; i++) {
        const start = convToSec(subtitleObject[i].startTime);
        const end = convToSec(subtitleObject[i].endTime);
        const { text } = subtitleObject[i];
        track.addCue(new VTTCue(start, end, text));
      }
      job = false;
      videoChange();
    }

    function videoChange() {
      const target = document.querySelector('.embed-responsive.embed-responsive-16by9');
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
          try {
            if (curUrl !== PLAYER.mediaId && !job) {
              player = PLAYER.player.el_.querySelector('video');
              captButtonState = true;
              handleCaptButton(player.textTracks[0]);
              fetchSubs();
            }
          } catch (error) {
            console.log(error);
          }
        });
      });
      const config = { attributes: false, childList: true, characterData: false };
      observer.observe(target, config);
    }

    function convToSec(time) {
      try {
        time = time.split(':');
        return parseInt(time[0]) * 60 * 60 + parseInt(time[1]) * 60 + parseFloat(time[2].replace(/,/, '.'));
      } catch (error) {
        console.log(error);
      }
    }
    let captButtonState = true;
    document.addEventListener('click', e => {
      if (e.target.matches('.vjs-captions-button')) {
        try {
          player = PLAYER.player.el_.querySelector('video');
          // let capt = PLAYER.player.controlBar.captionsButton.options_.tracks.tracks_[0]
          const tracks = player.textTracks[0];
          !captButtonState ? (tracks.mode = 'showing') : (tracks.mode = 'hidden');
          captButtonState = !captButtonState;
          handleCaptButton(captButtonState);
        } catch (error) {
          console.log(error);
        }
      }
    });

    function handleCaptButton(capt) {
      const but = document.querySelector('.vjs-captions-button');
      capt ? but.classList.add('vjs-captions-button_enabled') : but.classList.remove('vjs-captions-button_enabled');
    }

    
    function changeFontSize() {
        const fsize = localStorage.getItem('font_size');
        if (!fsize) return;

        const chatwrap = document.getElementById('chatwrap');
        if (!chatwrap) return;

        chatwrap.style.fontSize = `${fsize}px`;
    }

    changeFontSize();

    var parser = (function() {
      const r = {};
      r.fromSrt = function(r, e) {
        const n = e ? !0 : !1;
        r = r.replace(/\r/g, '');
        const i = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
        (r = r.split(i)), r.shift();
        for (var a = [], d = 0; d < r.length; d += 4) {
          a.push({
            id: r[d].trim(),
            startTime: n ? t(r[d + 1].trim()) : r[d + 1].trim(),
            endTime: n ? t(r[d + 2].trim()) : r[d + 2].trim(),
            text: r[d + 3].trim(),
          });
        }
        return a;
      };
      r.toSrt = function(r) {
        if (!(r instanceof Array)) return '';
        for (var t = '', n = 0; n < r.length; n++) {
          const i = r[n];
          isNaN(i.startTime) ||
            isNaN(i.endTime) ||
            ((i.startTime = e(parseInt(i.startTime, 10))), (i.endTime = e(parseInt(i.endTime, 10)))),
            (t += `${i.id}\r\n`),
            (t += `${i.startTime} --> ${i.endTime}\r\n`),
            (t += `${i.text.replace('\n', '\r\n')}\r\n\r\n`);
        }
        return t;
      };
      var t = function(r) {
        const t = /(\d+):(\d{2}):(\d{2}),(\d{3})/;

        const e = t.exec(r);
        if (e === null) return 0;
        for (let n = 1; n < 5; n++) (e[n] = parseInt(e[n], 10)), isNaN(e[n]) && (e[n] = 0);
        return 36e5 * e[1] + 6e4 * e[2] + 1e3 * e[3] + e[4];
      };

      var e = function(r) {
        const t = [36e5, 6e4, 1e3];

        const e = [];
        for (var n in t) {
          let i = ((r / t[n]) >> 0).toString();
          i.length < 2 && (i = `0${i}`), (r %= t[n]), e.push(i);
        }
        let a = r.toString();
        if (a.length < 3) {
          for (n = 0; n <= 3 - a.length; n++) a = `0${a}`;
        }
        return `${e.join(':')},${a}`;
      };
      return r;
    })();
  }
  subtitles();
})();
