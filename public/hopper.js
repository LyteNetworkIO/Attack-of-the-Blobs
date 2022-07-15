document.addEventListener('DOMContentLoaded', () => {
  
  let showWalletsBtn = document.getElementById('show-wallets-btn')  

  // Original JavaScript code by Chirp Internet: chirpinternet.eu
  // Please acknowledge use of this code by including this header.
  function getCookie(name) {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
  }
  let authToken = getCookie("authToken");

  console.log(authToken);
  const authTokenTrimmed = authToken.replaceAll('"', '');
  let showWallets = () => {
      var config = {
          method: 'get',
          url: "https://api.relysia.com/v1/wallets",
          headers: { authToken: authTokenTrimmed}
      };  
      axios(config)
      .then((response) => {
        let p2 = document.getElementById("wallets");
        p2.innerHTML = JSON.stringify(response.data.data, null, "<br>");
      })
  };
  showWalletsBtn.onclick = showWallets();

});