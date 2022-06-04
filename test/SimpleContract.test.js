const { assert } = require('chai');

const SimpleContract = artifacts.require('SimpleContract');

contract('SimpleContract', function (accounts) {
    let theLibrary;
    const someStringOnDeploy = 'I am deployed string';

    const account_owner = accounts[0];
    const account_1 = accounts[1];
    const account_2 = accounts[2];
    const account_3 = accounts[3];

    beforeEach(async function () {
        theLibrary = await SimpleContract.new(someStringOnDeploy);
    });

    it('Test: deployed', async function () {
        const someString = await theLibrary.getSomeString();
        assert.equal(someString, someStringOnDeploy, `Should be ${someStringOnDeploy}`);
    });

    it('Test: get/set someString', async function () {
        const newString = 'I am new string';
        await theLibrary.setSomeString(newString);
        const someString = await theLibrary.getSomeString();
        assert.equal(someString, newString, `Should bg ${newString}`);
    });
});