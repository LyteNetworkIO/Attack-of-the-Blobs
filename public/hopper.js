document.addEventListener('DOMContentLoaded', () => {

let showWalletsBtn = document.getElementById('show-wallets-btn')
let walletSelect = document.getElementById('wallet-select');  

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
if (typeof authTokenTrimmed === 'string') {
// 👇️ this runs
console.log('✅ type is string');
} else {
console.log('⛔️ type is NOT string');
}

showWalletsBtn.onclick = () => {
      console.log("and again: "+authTokenTrimmed)
      var config = {
          method: 'get',
          url: "https://api.relysia.com/v1/wallets",
          headers: { authToken: authTokenTrimmed}
      };
              
      axios(config)
      .then((response) => {
        for (let i=0; i<response.data.data.wallets.length; i++) {
          let walletTitle = response.data.data.wallets[i].walletTitle;
          walletSelect.add(new Option(walletTitle, walletTitle),undefined);
          console.log("Wallet "+i+": "+response.data.data.wallets[i].walletTitle);
        }
      })
  };

});
