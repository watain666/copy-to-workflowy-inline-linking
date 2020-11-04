browser.browserAction.onClicked.addListener(onClick);

function onClick() {
  getWorkflowyText();
  notify();
}

function notify() {
  browser.notifications.create({
    type: 'basic',
    iconUrl: browser.extension.getURL('icons/48.png'),
    title: 'Copy to Workflowy Inline Linking',
    message: `Page title and address have been copied and can now be pasted into Workflowy.`,
  });
}

// based on https://rawbytz.wordpress.com/clip-to-workflowy-code/
function getWorkflowyText() {
  browser.tabs.query({currentWindow: true, active: true})
    .then((tabs) => {
      let title = tabs[0].title;
      let url = tabs[0].url;
      const formated = {
        title,
        url
      } = formatBookmark(title, url);
      console.log(url, title);
      copyText(`<opml><body>` +
               `<outline text="&lt;a href=&quot;${formated.url}&quot;&gt;${formated.title}&lt;/a&gt; "></outline>` +
               `</body></opml>`);
  })
}

function formatBookmark(title, url) {
  // handle Workflowy links
  if (url.startsWith('https://workflowy.com/#/')) {
    const titlePrefix = ' - WorkFlowy';
    if (title.endsWith(titlePrefix)) {
      title = title.substring(0, title.length - titlePrefix.length);
    }
    url = `>> ${url}`;
  }

  title = title.trim();

  // remove emojis
  // TODO make this an option
  // based on https://stackoverflow.com/questions/10992921/how-to-remove-emoji-code-using-javascript
  title = title
    .replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '')
    .replace(/\s+/g, ' ');

  title = toOpmlAttribute(title);
  url = toOpmlAttribute(url);

  return {
    title,
    url
  };
}

function toOpmlAttribute(text) {
  return text
    .replace(/&/g, '&amp;amp;')
    .replace(/</g, '&amp;lt;')
    .replace(/>/g, '&amp;gt;')
    .replace(/"/g, '&quot;')
    .replace(/(\n)/g, '&#10;');
}

// based on https://stackoverflow.com/a/25275151/906113
function copyText(text) {
  const input = document.createElement('textarea');
  document.body.appendChild(input);
  input.style.cssText = 'position: fixed;'; // avoid scrolling to bottom of the page
  input.value = text;
  input.focus();
  input.select();
  document.execCommand('Copy');
  input.remove();
}
