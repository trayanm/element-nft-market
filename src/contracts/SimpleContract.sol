// SPDX-License-Identifier: ISC
pragma solidity ^0.8.0;

contract SimpleContract {
    string someString;

    constructor(string memory _someString) public {
        someString = _someString;
    }

    function getSomeString() public view returns (string memory) {
        return someString;
    }

    function setSomeString(string memory _someString) public {
        someString = _someString;
    }
}
