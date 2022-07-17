document.addEventListener('DOMContentLoaded', () => {
  let selectWalletsBtn = document.getElementById('select-wallets-btn')
  let walletSelect = document.getElementById('wallet-select'); 
  let playBtn = document.getElementById('play-btn');  

  // Original JavaScript code by Chirp Internet: chirpinternet.eu
  // Please acknowledge use of this code by including this header.
  function getCookie(name) {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
  }
  
  let authTokenExtracted = getCookie("authToken");
  const authTokenTrimmed = authTokenExtracted.replaceAll('"', '');
  console.log(authTokenTrimmed);

  var config = {
      method: 'get',
      url: "https://api.relysia.com/v1/wallets",
      headers: { authToken: authTokenTrimmed}
  };
          
  axios(config)
  .then((response) => {
    for (let i=0; i<response.data.data.wallets.length; i++) {
      let walletTitle = response.data.data.wallets[i].walletTitle;
      let walletID = response.data.data.wallets[i].walletID;
      walletSelect.add(new Option(walletTitle, walletID),undefined);
    }
  })

  selectWalletsBtn.onclick = function() {
    walletSelectedID = walletSelect.options[walletSelect.selectedIndex].value;
    console.log(walletSelect.options[walletSelect.selectedIndex].value)
    document.cookie='walletID='+walletSelectedID;
    window.location.href = "/play.html";
  }

});
