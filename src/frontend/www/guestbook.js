/* ================================================================================*/
/* Javascript code for Guestbook DApp
/* ================================================================================*/
// 这部分是用来检测Metamask作为ETH钱包是否被启动了的
/* Check if Metamask is installed. */
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
} else {
    console.log('Please install MetaMask or another browser-based wallet');
}

/* Instantiate a Web3 client that uses Metamask for transactions.  Then,
 * enable it for the site so user can grant permissions to the wallet */
const web3 = new Web3(window.ethereum);
window.ethereum.enable();

/* Grab ABI from compiled contract (e.g. in Remix) and fill it in.
 * Grab address of contract on the blockchain and fill it in.
 * Use the web3 client to instantiate the contract within program */

// 这里是用来存储ABI的
var GuestbookABI = [{"outputs":[],"inputs":[{"type":"address","name":"owneraddr"}],"stateMutability":"nonpayable","type":"constructor"},{"name":"sign","outputs":[],"inputs":[{"type":"string","name":"name"},{"type":"string","name":"email"},{"type":"string","name":"text"}],"stateMutability":"payable","type":"function","gas":1589692},{"name":"contractOwner","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1181},{"name":"messages","outputs":[{"type":"address","name":"useraddr"},{"type":"string","name":"textmsg"},{"type":"bool","name":"viewable"},{"type":"uint256","name":"update"}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":40284},{"name":"users","outputs":[{"type":"address","name":"addr"},{"type":"string","name":"name"},{"type":"string","name":"email"},{"type":"uint256","name":"lastupdate"},{"type":"bool","name":"viewable"}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":16571},{"name":"expirtime","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1271},{"name":"totalEth","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1301},{"name":"contractopen","outputs":[{"type":"bool","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1331},{"name":"sizeofmsgs","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1361}];
// 这里是用来存储协议的存储地址的
var Guestbook = new web3.eth.Contract(GuestbookABI,'0x8fd4cf0DBFcAa88c2bF40eB3195a34A6619179fa');

/* ================================================================================*/
/* Update the UI with current wallet account address when called */
async function updateAccount() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  const accountNode = document.getElementById("account");
  if (accountNode.firstChild)
    accountNode.firstChild.remove();
  var textnode = document.createTextNode(account);
  accountNode.appendChild(textnode);
}

/* ================================================================================*/
/* Update the UI with current minimum bounty when called */
async function updateBounty(){
  const bounty = await Guestbook.methods.bounty().call();
  updateBountyUI(bounty);
}

function updateBountyUI(value){
  const bountyNode = document.getElementById("bounty");
  if (bountyNode.firstChild)
    bountyNode.firstChild.remove();
  var textnode = document.createTextNode(value + " Wei");
  bountyNode.appendChild(textnode);
}

/* ================================================================================*/
/* Update the UI with Guestbook entries from contract when called */
async function updateEntries(){
  const entriesNode = document.getElementById("entries");

  while (entriesNode.firstChild) {
    entriesNode.firstChild.remove();
  }

  for (var i = 0 ; i < 3; i++) {
      var entry = await Guestbook.methods.gb(i).call();
      const nameAndEmail = document.createTextNode(
          entry.name + " <" + entry.email + ">"
      );
      const wallet = document.createTextNode(entry.signer);
      const entrydate = new Date(parseInt(entry.date)*1000);
      const signedOn = document.createTextNode("signed on " + entrydate.toUTCString() + " for " + entry.bounty_entry + " Wei");
      const message = document.createTextNode(entry.message);
      const br1 = document.createElement("br");
      const br2 = document.createElement("br");
      const br3 = document.createElement("br");
      const p = document.createElement("p");

      p.classList.add("entry");
      p.appendChild(nameAndEmail);
      p.appendChild(br1);
      p.appendChild(wallet);
      p.appendChild(br2);
      p.appendChild(signedOn);
      p.appendChild(br3);
      p.appendChild(message);

      entriesNode.appendChild(p);
  }

}

/* Issue a transaction to sign the guestbook based on form field values */
async function sign() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;
  const bounty = await Guestbook.methods.bounty().call();

  bid = parseInt(bounty) + 10;
  const transactionParameters = {
	  from: account,
	  gasPrice: 0x1D91CA3600,
	  value: bid
  };
  await Guestbook.methods.sign(name, email, message).send(transactionParameters);
};

/* Register a handler for when contract emits an Entry event after Guestbook is
 * signed to reload the page */
Guestbook.events.Entry().on("data", function(event) {
  updateBountyUI(event.returnValues.value);
  updateEntries();
});

/* Create submission button.  Then, register an event listener on it to invoke sign
 * transaction when clicked */
const button = document.getElementById('sign');
button.addEventListener('click', () => {
  sign();
});
