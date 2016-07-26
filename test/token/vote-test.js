var assert = require('assert');
var async = require('async');
var Sandbox = require('ethereum-sandbox-client');
var helper = require('ethereum-sandbox-helper');

describe('Vote Contract', function() {
  this.timeout(60000);

  var alice = '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826';
  var bob = '0xdedb49385ad5b94a16f236a6890cf9e0b1e30392';
  var price = 1000;
  var sandbox = new Sandbox('http://localhost:8554');
  var compiled = helper.compile('contracts', ['vote.sol']);
  var voteContract;

  before(function(done) {
    sandbox.start(__dirname + '/ethereum.json', done);
  });

  it('Deploy Vote contract', function(done) {
    sandbox.web3.eth.contract(JSON.parse(compiled.contracts['Vote'].interface)).new(
      "Test question?",
      {
        from: alice,
        data: '0x' + compiled.contracts['Vote'].bytecode
      },
      function(err, contract) {
        if (err) done(err);
        else if (contract.address) {
          voteContract = contract;
          done();
        }
      }
    );
  });

  // it('Buy tokens', function(done) {
  //   var value = 100111;
  //   var balanceBefore = sandbox.web3.eth.getBalance(alice);
  //
  //   assert(voteContract.balances(alice).eq(0), 'Alice balance is not zero');
  //   sandbox.web3.eth.sendTransaction({
  //     from: alice,
  //     to: voteContract.address,
  //     value: value
  //   }, function(err, txHash) {
  //     if (err) return done(err);
  //     helper.waitForReceipt(sandbox.web3, txHash, function(err, receipt) {
  //       if (err) return done(err);
  //
  //       var tokens = Math.floor(value / price);
  //       assert(voteContract.balances(alice).eq(tokens), 'Account has not get ' + tokens + ' tokens');
  //
  //       var txCost = sandbox.web3.eth.gasPrice.mul(receipt.gasUsed);
  //       var spent = tokens * price;
  //       var expectedBalance = balanceBefore.sub(txCost).sub(spent);
  //       assert(sandbox.web3.eth.getBalance(alice).eq(expectedBalance), 'Account balance is not correct');
  //
  //       done();
  //     });
  //   });
  // });

  it('Bob vote yes test', function(done) {
    // var bobValue = 50000;
    // var bobTokens = Math.floor(bobValue / price);
    // var aliceBalance = voteContract.balances(alice).toNumber();
    // var tokens = 25;

    async.series([
      voteYesBob
    ], function(err) {
      if (err) return done(err);

      assert(sandbox.web3.eth.getBalance(bob).eq(voteContract.resultsWeightedByEther()[0])/*, 'Yes votes is not correct'*/);

      done();
    });
  });

  it('Alice vote yes test', function(done) {

    async.series([
      voteYesAlice
    ], function(err) {
      if (err) return done(err);

      assert(sandbox.web3.eth.getBalance(alice).eq(voteContract.resultsWeightedByEther()[0])/*, 'Yes votes is not correct'*/);

      done();
    });
  });

  it('Bob and Alice vote yes test', function(done) {
    // var bobValue = 50000;
    // var bobTokens = Math.floor(bobValue / price);
    // var aliceBalance = voteContract.balances(alice).toNumber();
    // var tokens = 25;

    async.series([
      voteYesBob ,
      voteYesAlice
    ], function(err) {
      if (err) return done(err);
      // zero = 0;
      assert.equal(voteContract.resultsWeightedByEther()[0], (sandbox.web3.eth.getBalance(bob)+sandbox.web3.eth.getBalance(alice))/*, 'Yes votes is not correct'*/);
      //assert(voteContract.balances(alice).eq(aliceBalance + tokens), 'Alice balance is not correct');

      done();
    });
  });



  function voteYesBob(cb) {
    voteContract.voteYes({ from: bob }, function(err, txHash) {
      if (err) return cb(err);
      helper.waitForReceipt(sandbox.web3, txHash, cb);
    });
  }

  function voteNoBob(cb) {
    voteContract.voteNo({ from: bob }, function(err, txHash) {
      if (err) return cb(err);
      helper.waitForReceipt(sandbox.web3, txHash, cb);
    });
  }

    function voteYesAlice(cb) {
      voteContract.voteYes({ from: alice }, function(err, txHash) {
        if (err) return cb(err);
        helper.waitForReceipt(sandbox.web3, txHash, cb);
      });
    }

    function voteNoAlice(cb) {
      voteContract.voteNo({ from: alice }, function(err, txHash) {
        if (err) return cb(err);
        helper.waitForReceipt(sandbox.web3, txHash, cb);
      });
    }

  // it('Withdraw', function(done) {
  //   var tokensBefore = voteContract.balances(alice).toNumber();
  //   var tokensWithdraw = 100;
  //   var balanceBefore = sandbox.web3.eth.getBalance(alice);
  //
  //   voteContract.withdraw(tokensWithdraw, { from: alice }, function(err, txHash) {
  //     if (err) return done(err);
  //     helper.waitForReceipt(sandbox.web3, txHash, function(err, receipt) {
  //       if (err) return done(err);
  //
  //       assert(voteContract.balances(alice).eq(tokensBefore - tokensWithdraw), 'Alice tokens balance is not correct');
  //
  //       var txCost = sandbox.web3.eth.gasPrice.mul(receipt.gasUsed);
  //       var expectedBalance = balanceBefore.sub(txCost).add(tokensWithdraw * price);
  //       assert(sandbox.web3.eth.getBalance(alice).eq(expectedBalance), 'Alice balance is not correct');
  //
  //       done();
  //     });
  //   });
  // });

  after(function(done) {
    sandbox.stop(done);
  });
});
