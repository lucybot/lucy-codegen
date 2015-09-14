var PetStore = require('/home/ubuntu/git/lucy-codegen/test/golden/rest_client/node/client.js').PetStore;
var PetStoreClient = new PetStore('http://localhost:3333');

PetStoreClient.getPets({
  "type": "dog"
}) 
.then(function(result) {
  console.log(result.body);
});
