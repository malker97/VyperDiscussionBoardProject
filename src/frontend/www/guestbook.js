/* ================================================================================*/
/* Javascript code for Guestbook DApp
/* ================================================================================*/

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
var GuestbookABI = <FMI>;

var Guestbook = new web3.eth.Contract(GuestbookABI,'<FMI>');

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
